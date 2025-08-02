-- Script para verificar CPFs duplicados na tabela clientes
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- 1. Verificar se há CPFs duplicados por barbearia
SELECT 
    barbearia_id,
    cpf_id,
    COUNT(*) as quantidade,
    STRING_AGG(nome_completo, ', ') as nomes_clientes
FROM public.clientes 
GROUP BY barbearia_id, cpf_id 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 2. Verificar todos os clientes de uma barbearia específica
-- (Substitua 'SEU_BARBEARIA_ID' pelo ID real da barbearia)
SELECT 
    id,
    nome_completo,
    cpf_id,
    celular_whatsapp,
    data_cadastro
FROM public.clientes 
WHERE barbearia_id = 'SEU_BARBEARIA_ID'
ORDER BY data_cadastro DESC;

-- 3. Verificar a estrutura da constraint UNIQUE
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'clientes' 
    AND tc.constraint_type = 'UNIQUE';

-- 4. Verificar se há dados inconsistentes
SELECT 
    'CPF vazio' as problema,
    COUNT(*) as quantidade
FROM public.clientes 
WHERE cpf_id IS NULL OR cpf_id = ''

UNION ALL

SELECT 
    'CPF com espaços' as problema,
    COUNT(*) as quantidade
FROM public.clientes 
WHERE cpf_id LIKE '% %'

UNION ALL

SELECT 
    'CPF muito curto' as problema,
    COUNT(*) as quantidade
FROM public.clientes 
WHERE LENGTH(TRIM(cpf_id)) < 3;

-- 5. Limpar CPFs duplicados (CUIDADO: Execute apenas se necessário)
-- DELETE FROM public.clientes 
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT id,
--         ROW_NUMBER() OVER (PARTITION BY barbearia_id, cpf_id ORDER BY data_cadastro) as rn
--         FROM public.clientes
--     ) t WHERE rn > 1
-- ); 