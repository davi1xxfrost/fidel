-- Corrigir warnings restantes de performance - Índices

-- 1. Adicionar índice para foreign key não indexada
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario_id 
ON public.audit_logs(usuario_id);
 
-- 2. Remover índices não utilizados que foram criados mas não são usados
DROP INDEX IF EXISTS idx_niveis_fidelidade_barbearia_id;
DROP INDEX IF EXISTS idx_recompensas_barbearia_id;
DROP INDEX IF EXISTS idx_recompensas_cliente_id; 