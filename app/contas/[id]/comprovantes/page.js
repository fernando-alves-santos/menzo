"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import { formatarMoeda, NOMES_MESES, slugify } from "../../../../lib/contas";

export default function ComprovantesConta() {
  const router = useRouter();
  const params = useParams();
  const contaId = params.id;

  const [conta, setConta] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [ocupadoId, setOcupadoId] = useState(null);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);
  const pagamentoAlvoRef = useRef(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data: sessao } = await supabase.auth.getSession();
    if (!sessao.session) {
      router.replace("/login");
      return;
    }
    setUsuario(sessao.session.user);

    const { data: contaData } = await supabase
      .from("contas")
      .select("*")
      .eq("id", contaId)
      .single();

    const { data: pagamentosData } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("conta_id", contaId)
      .order("ano", { ascending: false })
      .order("mes", { ascending: false });

    setConta(contaData ?? null);
    setHistorico(pagamentosData ?? []);
    setCarregando(false);
  }, [contaId, router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrirComprovante(caminho) {
    setErro(null);
    const { data, error } = await supabase.storage
      .from("comprovantes")
      .createSignedUrl(caminho, 60);

    if (error || !data) {
      setErro("NÃO FOI POSSÍVEL ABRIR O COMPROVANTE.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  // Envia (ou troca) o comprovante de um mês. Se já existia um arquivo com
  // outra extensão, remove o antigo para não deixar lixo no storage.
  async function enviarArquivo(pagamento, arquivo) {
    if (!arquivo || !usuario || !conta) return;
    setErro(null);
    setOcupadoId(pagamento.id);

    const extensao = arquivo.name.split(".").pop();
    const caminho = `${usuario.id}/${slugify(conta.nome)}/${pagamento.ano}-${String(pagamento.mes).padStart(2, "0")}.${extensao}`;

    const { error: erroEnvio } = await supabase.storage
      .from("comprovantes")
      .upload(caminho, arquivo, { upsert: true });

    if (erroEnvio) {
      setErro("NÃO FOI POSSÍVEL ENVIAR O COMPROVANTE. TENTE NOVAMENTE.");
      setOcupadoId(null);
      return;
    }

    const caminhoAntigo = pagamento.comprovante_url;

    const { error: erroBanco } = await supabase
      .from("pagamentos")
      .update({ comprovante_url: caminho })
      .eq("id", pagamento.id);

    if (erroBanco) {
      setErro("O ARQUIVO FOI ENVIADO, MAS NÃO FOI POSSÍVEL VINCULAR AO PAGAMENTO.");
      setOcupadoId(null);
      return;
    }

    if (caminhoAntigo && caminhoAntigo !== caminho) {
      await supabase.storage.from("comprovantes").remove([caminhoAntigo]);
    }

    setOcupadoId(null);
    setMenuAbertoId(null);
    carregar();
  }

  async function excluirComprovante(pagamento) {
    if (!pagamento.comprovante_url) return;
    const ok = window.confirm(
      `EXCLUIR O COMPROVANTE DE ${NOMES_MESES[pagamento.mes - 1].toUpperCase()} ${pagamento.ano}? ESSA AÇÃO NÃO PODE SER DESFEITA.`
    );
    if (!ok) return;

    setErro(null);
    setOcupadoId(pagamento.id);

    const { error: erroStorage } = await supabase.storage
      .from("comprovantes")
      .remove([pagamento.comprovante_url]);

    if (erroStorage) {
      setErro("NÃO FOI POSSÍVEL EXCLUIR O ARQUIVO. TENTE NOVAMENTE.");
      setOcupadoId(null);
      return;
    }

    const { error: erroBanco } = await supabase
      .from("pagamentos")
      .update({ comprovante_url: null })
      .eq("id", pagamento.id);

    if (erroBanco) {
      setErro("O ARQUIVO FOI APAGADO, MAS NÃO FOI POSSÍVEL ATUALIZAR O REGISTRO.");
    }

    setOcupadoId(null);
    setMenuAbertoId(null);
    carregar();
  }

  function escolherArquivo(pagamento) {
    pagamentoAlvoRef.current = pagamento;
    inputRef.current?.click();
  }

  const itemMenu =
    "w-full text-left px-4 py-2.5 text-sm hover:bg-surface-soft transition-colors";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          const alvo = pagamentoAlvoRef.current;
          if (arquivo && alvo) enviarArquivo(alvo, arquivo);
          e.target.value = "";
        }}
      />

      <div className="mb-6">
        <Link href="/dashboard" className="text-xs text-ledger underline">
          &larr; VOLTAR AO DASHBOARD
        </Link>
        <p className="font-display text-2xl mt-2">
          {conta ? `COMPROVANTES - ${conta.nome}` : "COMPROVANTES"}
        </p>
        {conta && (
          <p className="text-xs text-ink-soft mt-1">
            HISTÓRICO COMPLETO DE PAGAMENTOS E COMPROVANTES DESTA CONTA
          </p>
        )}
      </div>

      {erro && <p className="text-sm text-stamp-red mb-4">{erro}</p>}

      {carregando ? (
        <p className="text-ink-soft text-sm">CARREGANDO...</p>
      ) : historico.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-ink-soft">NENHUM PAGAMENTO REGISTRADO AINDA PARA ESTA CONTA.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {historico.map((p) => {
            const aberto = menuAbertoId === p.id;
            const ocupado = ocupadoId === p.id;
            return (
              <div key={p.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {NOMES_MESES[p.mes - 1]} {p.ano}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {p.status === "pago" ? "PAGO" : p.status === "vencido" ? "VENCIDO" : "NO PRAZO"}
                      {p.data_pagamento ? ` - EM ${p.data_pagamento}` : ""}
                      {p.responsavel ? ` - RESPONSÁVEL: ${p.responsavel}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.valor_pago != null && (
                      <p className="text-sm">{formatarMoeda(p.valor_pago)}</p>
                    )}
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => setMenuAbertoId(aberto ? null : p.id)}
                      aria-expanded={aberto}
                      className="text-xs px-3 py-1.5 rounded-md border border-ledger text-ledger disabled:opacity-60"
                    >
                      {ocupado ? "AGUARDE..." : p.comprovante_url ? "COMPROVANTE ▾" : "ANEXAR ▾"}
                    </button>
                  </div>
                </div>

                {aberto && !ocupado && (
                  <div className="mt-3 border border-border rounded-md overflow-hidden divide-y divide-border">
                    {p.comprovante_url ? (
                      <>
                        <button type="button" className={itemMenu} onClick={() => abrirComprovante(p.comprovante_url)}>
                          VER COMPROVANTE
                        </button>
                        <button type="button" className={itemMenu} onClick={() => escolherArquivo(p)}>
                          TROCAR COMPROVANTE
                        </button>
                        <button
                          type="button"
                          className={`${itemMenu} text-stamp-red`}
                          onClick={() => excluirComprovante(p)}
                        >
                          EXCLUIR COMPROVANTE
                        </button>
                      </>
                    ) : (
                      <button type="button" className={itemMenu} onClick={() => escolherArquivo(p)}>
                        ANEXAR COMPROVANTE
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
