-- Script para debugar e corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar políticas RLS atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clientes';

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clientes';

-- 3. Remover políticas problemáticas
DROP POLICY IF EXISTS "Barbearias podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem criar seus próprios registros" ON public.clientes;
DROP POLICY IF EXISTS "Clientes autenticados podem criar seus registros" ON public.clientes;
DROP POLICY IF EXISTS "Permitir cadastro público de clientes" ON public.clientes;

-- 4. Criar política permissiva para inserção
CREATE POLICY "Permitir inserção de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- 5. Manter políticas de visualização
DROP POLICY IF EXISTS "Barbearias podem ver seus clientes" ON public.clientes;
CREATE POLICY "Barbearias podem ver seus clientes" 
ON public.clientes 
FOR SELECT 
USING (
    auth.uid()::text = barbearia_id::text OR
    auth.uid() = usuario_auth_id OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- 6. Manter políticas de atualização
DROP POLICY IF EXISTS "Barbearias podem atualizar seus clientes" ON public.clientes;
CREATE POLICY "Barbearias podem atualizar seus clientes" 
ON public.clientes 
FOR UPDATE 
USING (
    auth.uid()::text = barbearia_id::text OR
    auth.uid() = usuario_auth_id OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- 7. Verificar se a função generate_qr_code_id existe
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'generate_qr_code_id';

-- 8. Testar inserção manual (substitua os valores)
-- INSERT INTO public.clientes (
--     barbearia_id,
--     nome_completo,
--     cpf_id,
--     celular_whatsapp,
--     qr_code_id,
--     pontos_acumulados,
--     total_gasto,
--     nivel_fidelidade
-- ) VALUES (
--     'SEU_BARBEARIA_ID',
--     'Teste Cliente',
--     '12345678901',
--     '11999999999',
--     'TEST1234',
--     0,
--     0.00,
--     'BRONZE'
-- ); 