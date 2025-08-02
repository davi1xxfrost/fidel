-- Corrigindo a política de leitura para administradores na tabela de barbearias.

-- 1. Remover a política de leitura consolidada anterior para evitar conflitos.
DROP POLICY IF EXISTS "Acesso de leitura consolidado para barbearias" ON public.barbearias;

-- 2. Criar uma política permissiva que permite que qualquer usuário (autenticado ou anônimo) leia todas as barbearias.
-- Isso é necessário para a página de login, onde o usuário ainda não se autenticou mas precisa ver a lista de barbearias.
CREATE POLICY "Permitir leitura pública de barbearias" ON public.barbearias
FOR SELECT
TO anon, authenticated
USING (true);