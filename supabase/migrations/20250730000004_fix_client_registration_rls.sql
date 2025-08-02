-- Corrigir políticas RLS para permitir cadastro de clientes
-- O problema é que as políticas atuais não permitem inserção quando usuario_auth_id ainda não está definido

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Clientes podem criar seus próprios registros" ON public.clientes;
DROP POLICY IF EXISTS "Barbearias podem criar clientes" ON public.clientes;

-- Criar nova política que permite inserção para clientes autenticados
CREATE POLICY "Clientes autenticados podem criar seus registros" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
    auth.uid() = usuario_auth_id OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Criar política para barbearias criarem clientes
CREATE POLICY "Barbearias podem criar clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
    barbearia_id IN (
        SELECT id FROM public.barbearias 
        WHERE usuario_auth_id = auth.uid()
    ) OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Política para permitir inserção pública (para cadastro inicial)
CREATE POLICY "Permitir cadastro público de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- Manter políticas de visualização e atualização
DROP POLICY IF EXISTS "Clientes podem ver seus próprios dados" ON public.clientes;
CREATE POLICY "Clientes podem ver seus próprios dados" 
ON public.clientes 
FOR SELECT 
USING (
    auth.uid() = usuario_auth_id OR 
    barbearia_id IN (
        SELECT id FROM public.barbearias 
        WHERE usuario_auth_id = auth.uid()
    ) OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

DROP POLICY IF EXISTS "Clientes podem atualizar seus próprios dados" ON public.clientes;
CREATE POLICY "Clientes podem atualizar seus próprios dados" 
ON public.clientes 
FOR UPDATE 
USING (
    auth.uid() = usuario_auth_id OR
    barbearia_id IN (
        SELECT id FROM public.barbearias 
        WHERE usuario_auth_id = auth.uid()
    ) OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
); 