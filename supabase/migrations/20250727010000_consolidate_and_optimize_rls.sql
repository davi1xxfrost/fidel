-- Consolidando e Otimizando Políticas de Segurança em Nível de Linha (RLS)

-- Tabela: public.barbearias
-- Objetivo: Consolidar múltiplas políticas de SELECT e otimizar a chamada de auth.

-- 1. Remover políticas de SELECT existentes para os roles afetados.
DROP POLICY IF EXISTS "Admin pode ver todas as barbearias" ON public.barbearias;
DROP POLICY IF EXISTS "Barbearias podem ver seus próprios dados" ON public.barbearias;

-- 2. Criar uma política de SELECT consolidada e otimizada.
CREATE POLICY "Acesso de leitura consolidado para barbearias" ON public.barbearias
FOR SELECT
USING (
    -- Admins podem ver tudo
    (SELECT rolname FROM pg_roles WHERE oid = session_user::regrole) = 'service_role'
    OR
    -- Barbearias podem ver seus próprios dados
    ((select auth.uid()) = usuario_auth_id)
);

-- Tabela: public.clientes
-- Objetivo: Consolidar múltiplas políticas para todas as ações (ALL) e para SELECT.

-- 1. Remover políticas existentes para evitar conflitos.
DROP POLICY IF EXISTS "Cliente pode ver/editar seus próprios dados" ON public.clientes;
DROP POLICY IF EXISTS "Barbearia pode ver/editar seus clientes" ON public.clientes;
DROP POLICY IF EXISTS "Barbearia só vê seus clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admin pode tudo em clientes" ON public.clientes;

-- 2. Criar uma política de acesso total (ALL) consolidada.
CREATE POLICY "Acesso de escrita consolidado para clientes" ON public.clientes
FOR ALL
USING (
    -- Admins podem fazer tudo
    (SELECT rolname FROM pg_roles WHERE oid = session_user::regrole) = 'service_role'
    OR
    -- Clientes podem gerenciar seus próprios dados
    ((select auth.uid()) = id)
    OR
    -- Barbearias podem gerenciar seus clientes
    (barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid())))
);

-- 3. Criar uma política de leitura (SELECT) consolidada e separada, pois as condições são diferentes.
CREATE POLICY "Acesso de leitura consolidado para clientes" ON public.clientes
FOR SELECT
USING (
    -- Admins podem ver tudo
    (SELECT rolname FROM pg_roles WHERE oid = session_user::regrole) = 'service_role'
    OR
    -- Clientes podem ver seus próprios dados
    ((select auth.uid()) = id)
    OR
    -- Barbearias podem ver seus clientes
    (barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid())))
);