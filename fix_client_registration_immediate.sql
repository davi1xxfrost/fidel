-- Correção imediata para o erro 400 no cadastro de clientes
-- Este script corrige as políticas RLS que estão impedindo a inserção de clientes

-- 1. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Clientes podem criar seus próprios registros" ON public.clientes;
DROP POLICY IF EXISTS "Clientes autenticados podem criar seus registros" ON public.clientes;
DROP POLICY IF EXISTS "Barbearias podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir cadastro público de clientes" ON public.clientes;

-- 2. Criar política simples e permissiva para inserção
CREATE POLICY "Permitir inserção de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- 3. Manter políticas de visualização existentes
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

-- 4. Manter políticas de atualização
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

-- 5. Verificar se a função generate_qr_code_id existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_qr_code_id') THEN
        CREATE OR REPLACE FUNCTION generate_qr_code_id()
        RETURNS TEXT AS $$
        DECLARE
          new_id TEXT;
          done BOOL;
        BEGIN
          done := false;
          WHILE NOT done LOOP
            -- Gerar ID alfanumérico de 8 caracteres
            new_id := upper(substring(md5(random()::text) from 1 for 8));
            
            -- Verificar se já existe
            IF NOT EXISTS (SELECT 1 FROM public.clientes WHERE qr_code_id = new_id) THEN
              done := true;
            END IF;
          END LOOP;
          
          RETURN new_id;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- 6. Garantir que a tabela clientes tenha todos os campos necessários
DO $$
BEGIN
    -- Adicionar campo email se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN email TEXT;
    END IF;
    
    -- Adicionar campo usuario_auth_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'usuario_auth_id'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN usuario_auth_id UUID REFERENCES auth.users(id);
    END IF;
END $$; 