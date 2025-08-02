-- Script para corrigir CPFs duplicados existentes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar CPFs duplicados
SELECT 
    barbearia_id,
    cpf_id,
    COUNT(*) as quantidade,
    STRING_AGG(nome_completo, ', ') as nomes_clientes
FROM public.clientes 
WHERE cpf_id = '000.000.000-00'
GROUP BY barbearia_id, cpf_id 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 2. Atualizar CPFs duplicados para valores únicos
UPDATE public.clientes 
SET cpf_id = CONCAT('CLI-', id, '-', EXTRACT(EPOCH FROM data_cadastro)::text)
WHERE cpf_id = '000.000.000-00' 
AND id IN (
    SELECT id FROM (
        SELECT id,
        ROW_NUMBER() OVER (PARTITION BY barbearia_id, cpf_id ORDER BY data_cadastro) as rn
        FROM public.clientes 
        WHERE cpf_id = '000.000.000-00'
    ) t WHERE rn > 1
);

-- 3. Verificar se ainda há CPFs duplicados
SELECT 
    barbearia_id,
    cpf_id,
    COUNT(*) as quantidade
FROM public.clientes 
GROUP BY barbearia_id, cpf_id 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 4. Verificar se a correção funcionou
SELECT 
    id,
    nome_completo,
    cpf_id,
    data_cadastro
FROM public.clientes 
WHERE cpf_id LIKE 'CLI-%'
ORDER BY data_cadastro DESC
LIMIT 10; 