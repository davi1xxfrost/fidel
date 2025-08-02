# Implementação do Sistema de Associações Cliente-Barbearia

## 🎯 Objetivo
Permitir que um cliente tenha múltiplos cartões de fidelidade em diferentes barbearias.

## 📋 Passos para Implementação

### 1. **Aplicar Migração SQL**
Copie e cole este código no SQL Editor do Supabase:

```sql
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
```

### 2. **Arquivos Criados**

Os seguintes arquivos já foram criados no projeto:

- `src/types/associacoes.ts` - Interfaces TypeScript
- `src/hooks/useAssociacoes.ts` - Hook para gerenciar associações
- `src/components/ClienteAssociacoes.tsx` - Componente de exemplo

### 3. **Como Usar**

#### No componente de detalhes do cliente:
```tsx
import ClienteAssociacoes from '@/components/ClienteAssociacoes';

// Dentro do seu componente
<ClienteAssociacoes 
  clienteId={cliente.id} 
  clienteNome={cliente.nome_completo} 
/>
```

#### Para buscar associações programaticamente:
```tsx
import { useAssociacoes } from '@/hooks/useAssociacoes';

const { getAssociacoesCliente, getAssociacoesBarbearia } = useAssociacoes();

// Buscar associações de um cliente
const associacoes = await getAssociacoesCliente(clienteId);

// Buscar associações de uma barbearia
const associacoesBarbearia = await getAssociacoesBarbearia(barbeariaId);
```

## 🎉 Benefícios Implementados

### ✅ **Múltiplos Cartões**
- Um cliente pode ter cartões em várias barbearias
- Cada barbearia mantém seus próprios pontos
- Sistema flexível e escalável

### ✅ **Performance Otimizada**
- Índices criados para consultas rápidas
- Políticas RLS otimizadas com `(select auth.uid())`
- Funções auxiliares para operações comuns

### ✅ **Segurança Mantida**
- Políticas RLS para admins, barbearias e clientes
- Cada usuário vê apenas o que deve ver
- Controle de acesso granular

### ✅ **Interface Moderna**
- Componente React com design responsivo
- Badges coloridos para níveis de fidelidade
- Estados de loading e empty state

## 🔄 Próximos Passos

1. **Aplicar a migração SQL** no Supabase
2. **Testar as funcionalidades** existentes
3. **Integrar o componente** onde necessário
4. **Implementar funcionalidades adicionais** (adicionar/remover cartões)

## 📊 Estrutura Final

```
cliente_barbearia_associacoes
├── id (UUID, PK)
├── cliente_id (UUID, FK)
├── barbearia_id (UUID, FK)
├── pontos_acumulados (INTEGER)
├── nivel_fidelidade (TEXT)
├── data_associacao (TIMESTAMP)
└── ativo (BOOLEAN)
```

**Relacionamentos:**
- Um cliente pode ter múltiplas associações
- Uma barbearia pode ter múltiplos clientes
- Cada associação tem seus próprios pontos e nível

## 🚀 Resultado

Agora um cliente pode ter cartões de fidelidade em múltiplas barbearias, cada uma com seus próprios pontos e níveis, mantendo a performance e segurança do sistema! 