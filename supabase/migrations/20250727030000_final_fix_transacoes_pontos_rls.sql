-- Correção definitiva para as políticas de RLS da tabela transacoes_pontos

-- 1. Remover TODAS as políticas conflitantes e duplicadas existentes para a tabela.
-- As duas primeiras são as que aparecem no log de erros.
DROP POLICY IF EXISTS "Acesso consolidado para transacoes de pontos" ON public.transacoes_pontos;
DROP POLICY IF EXISTS "Acesso consolidado para transacoes_pontos" ON public.transacoes_pontos;
-- As duas seguintes são de migrações anteriores para garantir a limpeza completa.
DROP POLICY IF EXISTS "Barbearias podem criar transações" ON public.transacoes_pontos;
DROP POLICY IF EXISTS "Barbearia só vê suas transações" ON public.transacoes_pontos;

-- 2. Criar UMA ÚNICA política consolidada para TODAS as ações com um nome claro e inequívoco.
CREATE POLICY "Regra Unica de Acesso para Transacoes de Pontos" ON public.transacoes_pontos
FOR ALL
TO authenticated
USING (
    barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid()))
)
WITH CHECK (
    barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid()))
);