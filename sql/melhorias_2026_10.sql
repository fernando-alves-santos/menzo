-- Rode no Supabase: SQL Editor -> New query -> cole -> Run.
-- Não contém nenhuma chave/senha. Rode UM bloco por vez e confira o resultado.

-- 1) CONFERIR antes de mudar (IPTV e cartões existentes):
select id, nome, rotativo, tipo, ordem_rotativo, rotativo_inicio_mes, rotativo_inicio_ano, valor_esperado
from contas
where nome ilike '%iptv%';

select id, nome, dia_fechamento from contas where dia_fechamento is not null;

-- 2) IPTV: sai de ROTATIVAS e vai para FIXAS.
--    O histórico (pagamentos de meses anteriores) é mantido.
update contas
set rotativo = false,
    ordem_rotativo = null,
    rotativo_inicio_mes = null,
    rotativo_inicio_ano = null
where nome ilike '%iptv%';

-- 3) MENSALIDADE REGINA - R$ 300,00 - conta corrente - dia 07 - Educação
insert into contas (nome, categoria, dia_vencimento, valor_esperado, forma_pagamento)
values ('MENSALIDADE REGINA', 'Educação', 7, 300.00, 'conta_corrente');

-- 4) RIPPLY AUTOMAÇÃO - R$ 59,90 - cartão Bradesco - dia 14 - Trabalho
--    Se o nome do seu cartão não contiver "bradesco", ajuste o ilike.
insert into contas (nome, categoria, dia_vencimento, valor_esperado, forma_pagamento, cartao_id)
values (
  'RIPPLY AUTOMAÇÃO', 'Trabalho', 14, 59.90, 'cartao_credito',
  (select id from contas where dia_fechamento is not null and nome ilike '%bradesco%' limit 1)
);

-- 5) (Opcional) deixar os nomes já cadastrados em MAIÚSCULAS no banco:
-- update contas set nome = upper(nome);
