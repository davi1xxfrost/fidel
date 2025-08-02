-- Implementar sistema de associações cliente-barbearia
-- Migração para permitir múltiplos cartões de fidelidade

-- =====================================================
-- 1. CRIAR TABELA DE ASSOCIAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cliente_barbearia_associacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    barbearia_id UUID NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
    pontos_acumulados INTEGER NOT NULL DEFAULT 0,
    nivel_fidelidade TEXT NOT NULL DEFAULT 'BRONZE' CHECK (nivel_fidelidade IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    data_associacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ativo BOOLEAN NOT NULL DEFAULT true,
    
    -- Garantir que um cliente só tenha uma associação ativa por barbearia
    UNIQUE(cliente_id, barbearia_id)
);

-- =====================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cliente_barbearia_associacoes_cliente_id 
ON public.cliente_barbearia_associacoes(cliente_id);

CREATE INDEX IF NOT EXISTS idx_cliente_barbearia_associacoes_barbearia_id 
ON public.cliente_barbearia_associacoes(barbearia_id);

CREATE INDEX IF NOT EXISTS idx_cliente_barbearia_associacoes_ativo 
ON public.cliente_barbearia_associacoes(ativo);

-- =====================================================
-- 3. HABILITAR RLS E CRIAR POLÍTICAS
-- =====================================================

ALTER TABLE public.cliente_barbearia_associacoes ENABLE ROW LEVEL SECURITY;

-- Política para barbearias verem suas associações
CREATE POLICY "Barbearias podem ver suas associações"
ON public.cliente_barbearia_associacoes
FOR SELECT
USING (
  barbearia_id IN (
    SELECT id FROM public.barbearias 
    WHERE usuario_auth_id = (select auth.uid())
  )
);

-- Política para barbearias gerenciarem suas associações
CREATE POLICY "Barbearias podem gerenciar suas associações"
ON public.cliente_barbearia_associacoes
FOR ALL
USING (
  barbearia_id IN (
    SELECT id FROM public.barbearias 
    WHERE usuario_auth_id = (select auth.uid())
  )
);

-- Política para clientes verem suas próprias associações
CREATE POLICY "Clientes podem ver suas associações"
ON public.cliente_barbearia_associacoes
FOR SELECT
USING (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE usuario_auth_id = (select auth.uid())
  )
);

-- =====================================================
-- 4. MIGRAR DADOS EXISTENTES
-- =====================================================

-- Inserir associações baseadas nos dados existentes
INSERT INTO public.cliente_barbearia_associacoes (
    cliente_id,
    barbearia_id,
    pontos_acumulados,
    nivel_fidelidade,
    data_associacao,
    ativo
)
SELECT 
    id as cliente_id,
    barbearia_id,
    pontos_acumulados,
    nivel_fidelidade,
    data_cadastro as data_associacao,
    true as ativo
FROM public.clientes
WHERE id IS NOT NULL AND barbearia_id IS NOT NULL
ON CONFLICT (cliente_id, barbearia_id) DO NOTHING;

-- =====================================================
-- 5. CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter associações de uma barbearia
CREATE OR REPLACE FUNCTION public.get_barbearia_associacoes(p_barbearia_id UUID)
RETURNS TABLE (
    id UUID,
    cliente_id UUID,
    cliente_nome TEXT,
    cliente_cpf TEXT,
    pontos_acumulados INTEGER,
    nivel_fidelidade TEXT,
    data_associacao TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cba.id,
        cba.cliente_id,
        c.nome_completo,
        c.cpf_id,
        cba.pontos_acumulados,
        cba.nivel_fidelidade,
        cba.data_associacao,
        cba.ativo
    FROM public.cliente_barbearia_associacoes cba
    JOIN public.clientes c ON cba.cliente_id = c.id
    WHERE cba.barbearia_id = p_barbearia_id
    ORDER BY cba.pontos_acumulados DESC;
END;
$$;

-- Função para adicionar pontos a uma associação
CREATE OR REPLACE FUNCTION public.adicionar_pontos_associacao(
    p_associacao_id UUID,
    p_pontos INTEGER,
    p_descricao TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.cliente_barbearia_associacoes
    SET pontos_acumulados = pontos_acumulados + p_pontos
    WHERE id = p_associacao_id;
    
    -- Registrar transação
    INSERT INTO public.transacoes_pontos (
        cliente_id,
        barbearia_id,
        tipo,
        valor_pontos,
        descricao
    )
    SELECT 
        cliente_id,
        barbearia_id,
        'GANHO',
        p_pontos,
        COALESCE(p_descricao, 'Pontos adicionados')
    FROM public.cliente_barbearia_associacoes
    WHERE id = p_associacao_id;
    
    RETURN FOUND;
END;
$$; 