-- Corrigir warnings de performance RLS

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Admins podem excluir barbearias" ON public.barbearias;
DROP POLICY IF EXISTS "Admins podem atualizar barbearias" ON public.barbearias;
DROP POLICY IF EXISTS "Barbearias podem atualizar seus próprios dados" ON public.barbearias;
DROP POLICY IF EXISTS "Admins podem ver todos os logs de auditoria" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins podem inserir logs de auditoria" ON public.audit_logs;

-- 2. Recriar políticas otimizadas para barbearias
CREATE POLICY "Admins podem excluir barbearias"
ON public.barbearias
FOR DELETE
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

CREATE POLICY "Acesso de atualização consolidado para barbearias"
ON public.barbearias
FOR UPDATE
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
  OR
  (select auth.uid()) = usuario_auth_id
);

-- 3. Recriar políticas otimizadas para audit_logs
CREATE POLICY "Admins podem ver todos os logs de auditoria"
ON public.audit_logs
FOR SELECT
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

CREATE POLICY "Admins podem inserir logs de auditoria"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
); 