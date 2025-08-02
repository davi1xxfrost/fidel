-- Corrigindo e consolidando políticas de RLS para a tabela transacoes_pontos

-- 1. Remover as políticas de SELECT e INSERT conflitantes existentes.
DROP POLICY IF EXISTS "Barbearias podem ver suas transações" ON public.transacoes_pontos;
DROP POLICY IF EXISTS "Barbearia só vê suas transações" ON public.transacoes_pontos;
DROP POLICY IF EXISTS "Barbearias podem criar transações" ON public.transacoes_pontos;

-- 2. Criar uma política consolidada para TODAS as ações (SELECT, INSERT).
CREATE POLICY "Acesso consolidado para transacoes_pontos" ON public.transacoes_pontos
FOR ALL
USING (
    -- Barbearias podem ver e inserir transações que pertencem a elas.
    barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid()))
)
WITH CHECK (
    -- A condição de verificação para INSERT é a mesma da de visualização.
    barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid()))
);