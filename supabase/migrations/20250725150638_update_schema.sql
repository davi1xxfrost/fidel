-- Adicionar coluna usuario_auth_id em barbearias se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'barbearias' 
    AND column_name = 'usuario_auth_id'
  ) THEN
    ALTER TABLE public.barbearias 
    ADD COLUMN usuario_auth_id UUID UNIQUE REFERENCES auth.users(id);
  END IF;
END $$;

-- Criar tabela de admins se não existir
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Políticas para admins
CREATE POLICY "Admins podem ver todos os registros"
ON public.admins
FOR SELECT
USING (auth.uid() IN (SELECT usuario_auth_id FROM public.admins));

-- Ajustar políticas da tabela barbearias
DROP POLICY IF EXISTS "Barbearias podem ver seus próprios dados" ON public.barbearias;
DROP POLICY IF EXISTS "Barbearias podem atualizar seus próprios dados" ON public.barbearias;

-- Nova política para permitir que barbearias vejam seus dados
CREATE POLICY "Barbearias podem ver seus próprios dados"
ON public.barbearias
FOR SELECT
USING (
  auth.uid() = usuario_auth_id OR -- própria barbearia
  auth.uid() IN (SELECT usuario_auth_id FROM public.admins) -- admins
);

-- Nova política para permitir que barbearias atualizem seus dados
CREATE POLICY "Barbearias podem atualizar seus próprios dados"
ON public.barbearias
FOR UPDATE
USING (
  auth.uid() = usuario_auth_id OR -- própria barbearia
  auth.uid() IN (SELECT usuario_auth_id FROM public.admins) -- admins
);

-- Nova política para permitir inserção de barbearias
CREATE POLICY "Permitir inserção de barbearias"
ON public.barbearias
FOR INSERT
WITH CHECK (
  auth.uid() = usuario_auth_id OR -- própria barbearia
  auth.uid() IN (SELECT usuario_auth_id FROM public.admins) -- admins
);

-- Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admins 
    WHERE usuario_auth_id = auth.uid()
  );
$$; 