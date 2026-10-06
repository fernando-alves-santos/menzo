"use client";

import { NOMES_MESES } from "../lib/contas";

// Seletor de mês/ano com botões grandes e rotulados em texto.
// Props: mes (1-12), ano, onMudar(novoMes, novoAno), onHoje (opcional).
export default function SeletorMesAno({ mes, ano, onMudar, onHoje }) {
  const hoje = new Date();
  const ehMesAtual = mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();

  function mudarMes(delta) {
    let m = mes + delta;
    let a = ano;
    if (m > 12) { m = 1; a += 1; }
    if (m < 1) { m = 12; a -= 1; }
    onMudar(m, a);
  }

  const btn =
    "flex-1 sm:flex-none px-3 py-2 rounded-md border border-border bg-surface text-sm font-medium hover:bg-surface-soft transition-colors";

  return (
    <div className="mb-4 bg-surface border border-border rounded-lg p-3">
      <p className="text-center font-display text-xl mb-3">
        {NOMES_MESES[mes - 1]} DE {ano}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-soft w-10">MÊS</span>
          <button type="button" onClick={() => mudarMes(-1)} className={btn} aria-label="Mês anterior">
            ◀ ANTERIOR
          </button>
          <button type="button" onClick={() => mudarMes(1)} className={btn} aria-label="Próximo mês">
            PRÓXIMO ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-soft w-10">ANO</span>
          <button type="button" onClick={() => onMudar(mes, ano - 1)} className={btn} aria-label="Ano anterior">
            ◀ {ano - 1}
          </button>
          <button type="button" onClick={() => onMudar(mes, ano + 1)} className={btn} aria-label="Próximo ano">
            {ano + 1} ▶
          </button>
        </div>
      </div>

      {!ehMesAtual && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => (onHoje ? onHoje() : onMudar(hoje.getMonth() + 1, hoje.getFullYear()))}
            className="text-xs text-ledger underline"
          >
            VOLTAR PARA O MÊS ATUAL
          </button>
        </div>
      )}
    </div>
  );
}
