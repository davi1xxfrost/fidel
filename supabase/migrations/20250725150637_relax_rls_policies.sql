-- Temporariamente permitir acesso público para teste do QR code
-- Remove as políticas RLS existentes
DROP POLICY IF EXISTS "Barbearias podem ver seus clientes" ON public.clientes;
DROP POLICY IF EXISTS "Barbearias podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Barbearias podem atualizar seus clientes" ON public.clientes;

-- Cria política temporária para permitir acesso público de leitura
CREATE POLICY "Permitir leitura pública temporária" 
ON public.clientes 
FOR SELECT 
USING (true);

-- Cria política temporária para permitir criação pública
CREATE POLICY "Permitir criação pública temporária" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- Cria política temporária para permitir atualização pública
CREATE POLICY "Permitir atualização pública temporária" 
ON public.clientes 
FOR UPDATE 
USING (true);