-- Implementar sistema de associações cliente-barbearia
-- Solução 2: Tabela de associações para múltiplos cartões de fidelidade

-- =====================================================
-- 1. CRIAR NOVA TABELA DE ASSOCIAÇÕES
-- =====================================================

CREATE TABLE public.cliente_barbearia_associacoes (
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

CREATE INDEX idx_cliente_barbearia_associacoes_cliente_id 
ON public.cliente_barbearia_associacoes(cliente_id);

CREATE INDEX idx_cliente_barbearia_associacoes_barbearia_id 
ON public.cliente_barbearia_associacoes(barbearia_id);

CREATE INDEX idx_cliente_barbearia_associacoes_ativo 
ON public.cliente_barbearia_associacoes(ativo);

-- =====================================================
-- 3. HABILITAR RLS E CRIAR POLÍTICAS OTIMIZADAS
-- =====================================================

ALTER TABLE public.cliente_barbearia_associacoes ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todas as associações
CREATE POLICY "Admins podem ver todas as associações"
ON public.cliente_barbearia_associacoes
FOR SELECT
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

-- Política para admins gerenciarem todas as associações
CREATE POLICY "Admins podem gerenciar todas as associações"
ON public.cliente_barbearia_associacoes
FOR ALL
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

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
  cliente_id = (select auth.uid())
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
WHERE id IS NOT NULL AND barbearia_id IS NOT NULL;

-- =====================================================
-- 5. CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter todas as associações de um cliente
CREATE OR REPLACE FUNCTION public.get_cliente_associacoes(p_cliente_id UUID)
RETURNS TABLE (
    id UUID,
    barbearia_id UUID,
    barbearia_nome TEXT,
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
        cba.barbearia_id,
        b.nome_barbearia,
        cba.pontos_acumulados,
        cba.nivel_fidelidade,
        cba.data_associacao,
        cba.ativo
    FROM public.cliente_barbearia_associacoes cba
    JOIN public.barbearias b ON cba.barbearia_id = b.id
    WHERE cba.cliente_id = p_cliente_id
    ORDER BY cba.data_associacao DESC;
END;
$$;

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

-- =====================================================
-- 6. ATUALIZAR POLÍTICAS EXISTENTES (OPCIONAL)
-- =====================================================

-- Comentário: As políticas existentes das tabelas clientes e barbearias
-- continuam funcionando normalmente. A nova tabela é complementar.

-- =====================================================
-- COMENTÁRIOS SOBRE A IMPLEMENTAÇÃO
-- =====================================================

/*
IMPLEMENTAÇÃO COMPLETA - SISTEMA DE ASSOCIAÇÕES CLIENTE-BARBEARIA

BENEFÍCIOS:
1. Um cliente pode ter múltiplos cartões de fidelidade
2. Cada barbearia mantém seus próprios pontos para o cliente
3. Sistema escalável e flexível
4. Políticas RLS otimizadas para performance
5. Funções auxiliares para operações comuns

ESTRUTURA:
- Tabela cliente_barbearia_associacoes: Relacionamento N:N
- Índices otimizados para performance
- Políticas RLS seguras e eficientes
- Funções para consultas comuns

PRÓXIMOS PASSOS:
1. Atualizar código TypeScript para usar nova estrutura
2. Criar interfaces para múltiplos cartões
3. Implementar UI para gerenciar associações
4. Testar funcionalidades existentes e novas
*/ 