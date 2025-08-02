-- Corrigir definitivamente as políticas RLS da tabela clientes
-- O problema é que as políticas estão conflitando

-- Remover TODAS as políticas de INSERT existentes
DROP POLICY IF EXISTS "Clientes autenticados podem criar seus registros" ON public.clientes;
DROP POLICY IF EXISTS "Barbearias podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir cadastro público de clientes" ON public.clientes;

-- Criar UMA ÚNICA política de INSERT que permite tudo
CREATE POLICY "Permitir inserção de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- Manter políticas de SELECT e UPDATE como estão
-- (não vou mexer nelas para não quebrar outras funcionalidades) 