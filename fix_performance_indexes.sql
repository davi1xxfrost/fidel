-- Corrigir warnings de performance - Índices

-- 1. Adicionar índices para foreign keys não indexadas
CREATE INDEX IF NOT EXISTS idx_niveis_fidelidade_barbearia_id 
ON public.niveis_fidelidade(barbearia_id);

CREATE INDEX IF NOT EXISTS idx_recompensas_barbearia_id 
ON public.recompensas(barbearia_id);

CREATE INDEX IF NOT EXISTS idx_recompensas_cliente_id 
ON public.recompensas(cliente_id);

-- 2. Remover índices não utilizados
DROP INDEX IF EXISTS idx_transacoes_data;
DROP INDEX IF EXISTS idx_audit_logs_usuario_id;
DROP INDEX IF EXISTS idx_audit_logs_acao;
DROP INDEX IF EXISTS idx_audit_logs_tabela;
DROP INDEX IF EXISTS idx_audit_logs_nivel;
DROP INDEX IF EXISTS idx_audit_logs_created_at; 