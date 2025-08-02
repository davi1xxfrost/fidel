-- Adicionar campos de autenticação à tabela clientes
-- Adicionar coluna usuario_auth_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'usuario_auth_id'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN usuario_auth_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Adicionar coluna email se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN email TEXT;
    END IF;
END $$;

-- Atualizar políticas RLS para incluir clientes autenticados
DROP POLICY IF EXISTS "Clientes podem ver seus próprios dados" ON public.clientes;
CREATE POLICY "Clientes podem ver seus próprios dados" 
ON public.clientes 
FOR SELECT 
USING (
    auth.uid() = usuario_auth_id OR 
    auth.uid()::text = barbearia_id::text OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Permitir que clientes criem seus próprios registros
DROP POLICY IF EXISTS "Clientes podem criar seus próprios registros" ON public.clientes;
CREATE POLICY "Clientes podem criar seus próprios registros" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
    auth.uid() = usuario_auth_id OR
    auth.uid()::text = barbearia_id::text OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Permitir que clientes atualizem seus próprios dados
DROP POLICY IF EXISTS "Clientes podem atualizar seus próprios dados" ON public.clientes;
CREATE POLICY "Clientes podem atualizar seus próprios dados" 
ON public.clientes 
FOR UPDATE 
USING (
    auth.uid() = usuario_auth_id OR
    auth.uid()::text = barbearia_id::text OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
); 