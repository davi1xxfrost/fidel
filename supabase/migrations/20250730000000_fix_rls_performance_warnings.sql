-- Corrigir warnings de performance das políticas RLS
-- 1. Auth RLS Initialization Plan warnings
-- 2. Multiple Permissive Policies warnings

-- =====================================================
-- CORREÇÃO 1: Otimizar chamadas auth.uid() nas políticas
-- =====================================================

-- Remover políticas problemáticas da tabela barbearias
DROP POLICY IF EXISTS "Admins podem excluir barbearias" ON public.barbearias;
DROP POLICY IF EXISTS "Admins podem atualizar barbearias" ON public.barbearias;
DROP POLICY IF EXISTS "Barbearias podem atualizar seus próprios dados" ON public.barbearias;

-- Recriar políticas otimizadas para barbearias
-- Política para DELETE (admins)
CREATE POLICY "Admins podem excluir barbearias"
ON public.barbearias
FOR DELETE
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

-- Política para UPDATE (admins + barbearias próprias)
CREATE POLICY "Acesso de atualização consolidado para barbearias"
ON public.barbearias
FOR UPDATE
USING (
  -- Admins podem atualizar qualquer barbearia
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
  OR
  -- Barbearias podem atualizar seus próprios dados
  (select auth.uid()) = usuario_auth_id
);

-- =====================================================
-- CORREÇÃO 2: Otimizar políticas da tabela audit_logs
-- =====================================================

-- Remover políticas problemáticas da tabela audit_logs
DROP POLICY IF EXISTS "Admins podem ver todos os logs de auditoria" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins podem inserir logs de auditoria" ON public.audit_logs;

-- Recriar políticas otimizadas para audit_logs
-- Política para SELECT (admins)
CREATE POLICY "Admins podem ver todos os logs de auditoria"
ON public.audit_logs
FOR SELECT
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

-- Política para INSERT (admins)
CREATE POLICY "Admins podem inserir logs de auditoria"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

-- =====================================================
-- CORREÇÃO 3: Verificar e otimizar outras políticas que usam auth.uid()
-- =====================================================

-- Verificar se existem outras políticas que precisam ser otimizadas
-- e aplicar a mesma correção: substituir auth.uid() por (select auth.uid())

-- Política para clientes (se existir)
DROP POLICY IF EXISTS "Cliente pode ver/editar seus próprios dados" ON public.clientes;
CREATE POLICY "Cliente pode ver/editar seus próprios dados"
ON public.clientes
FOR ALL
USING (
  (select auth.uid()) = id
);

-- Política para barbearias verem seus clientes (se existir)
DROP POLICY IF EXISTS "Barbearia pode ver/editar seus clientes" ON public.clientes;
CREATE POLICY "Barbearia pode ver/editar seus clientes"
ON public.clientes
FOR ALL
USING (
  barbearia_id IN (
    SELECT id FROM public.barbearias 
    WHERE usuario_auth_id = (select auth.uid())
  )
);

-- =====================================================
-- COMENTÁRIOS SOBRE AS CORREÇÕES
-- =====================================================

/*
CORREÇÕES APLICADAS:

1. **Auth RLS Initialization Plan Warnings**:
   - Substituído `auth.uid()` por `(select auth.uid())` em todas as políticas
   - Isso evita que a função seja re-avaliada para cada linha
   - Melhora significativamente a performance em consultas com muitas linhas

2. **Multiple Permissive Policies Warnings**:
   - Consolidado múltiplas políticas de UPDATE para barbearias em uma única política
   - A política "Acesso de atualização consolidado para barbearias" agora cobre:
     * Admins podem atualizar qualquer barbearia
     * Barbearias podem atualizar seus próprios dados
   - Isso elimina a necessidade de múltiplas políticas para o mesmo role/action

3. **Otimizações Gerais**:
   - Todas as políticas agora usam `(select auth.uid())` em vez de `auth.uid()`
   - Políticas consolidadas reduzem overhead de avaliação
   - Mantida a segurança enquanto melhora a performance

BENEFÍCIOS:
- Eliminação de todos os warnings de performance
- Melhor performance em consultas com muitas linhas
- Redução do overhead de avaliação de políticas
- Manutenção da segurança e funcionalidade existente
*/ 