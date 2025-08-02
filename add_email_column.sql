-- Adicionar campo email na tabela clientes
-- Execute este script no SQL Editor do Supabase

-- Verificar se o campo email já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'email'
    ) THEN
        -- Adicionar campo email
        ALTER TABLE public.clientes ADD COLUMN email TEXT;
        
        -- Adicionar índice para performance
        CREATE INDEX idx_clientes_email ON public.clientes(email);
        
        RAISE NOTICE 'Campo email adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo email já existe!';
    END IF;
END $$;

-- Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position; 