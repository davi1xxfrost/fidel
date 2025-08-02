-- Atualizar níveis de fidelidade e adicionar função de cálculo automático
-- Migração para implementar sistema de níveis atualizado

-- =====================================================
-- 1. ATUALIZAR NÍVEIS EXISTENTES
-- =====================================================

-- Atualizar níveis baseado nos pontos atuais
UPDATE public.clientes 
SET nivel_fidelidade = CASE 
  WHEN pontos_acumulados >= 400 THEN 'DIAMOND'
  WHEN pontos_acumulados >= 250 THEN 'BLACK'
  WHEN pontos_acumulados >= 100 THEN 'GOLD'
  ELSE 'PRATA'
END;

-- =====================================================
-- 2. CRIAR FUNÇÃO PARA CALCULAR NÍVEL AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_nivel_fidelidade(pontos INTEGER)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE 
    WHEN pontos >= 400 THEN 'DIAMOND'
    WHEN pontos >= 250 THEN 'BLACK'
    WHEN pontos >= 100 THEN 'GOLD'
    ELSE 'PRATA'
  END;
END;
$$;

-- =====================================================
-- 3. CRIAR TRIGGER PARA ATUALIZAR NÍVEL AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_nivel_fidelidade()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular novo nível baseado nos pontos
  NEW.nivel_fidelidade := calcular_nivel_fidelidade(NEW.pontos_acumulados);
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar nível automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_nivel_fidelidade ON public.clientes;

CREATE TRIGGER trigger_atualizar_nivel_fidelidade
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_nivel_fidelidade();

-- =====================================================
-- 4. ATUALIZAR CONSTRAINT DE NÍVEIS
-- =====================================================

-- Remover constraint antiga se existir
ALTER TABLE public.clientes 
DROP CONSTRAINT IF EXISTS check_nivel_fidelidade;

-- Adicionar nova constraint com os novos níveis
ALTER TABLE public.clientes 
ADD CONSTRAINT check_nivel_fidelidade 
CHECK (nivel_fidelidade IN ('PRATA', 'GOLD', 'BLACK', 'DIAMOND'));

-- =====================================================
-- 5. CRIAR ÍNDICE PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clientes_nivel_fidelidade 
ON public.clientes(nivel_fidelidade);

CREATE INDEX IF NOT EXISTS idx_clientes_pontos_nivel 
ON public.clientes(pontos_acumulados, nivel_fidelidade); 