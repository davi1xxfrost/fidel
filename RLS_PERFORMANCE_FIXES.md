# Correções de Performance RLS - Supabase

## Resumo dos Warnings Corrigidos

Este documento descreve as correções aplicadas para resolver os warnings de performance das políticas RLS (Row Level Security) no Supabase.

## Warnings Identificados

### 1. Auth RLS Initialization Plan Warnings
- **Problema**: Chamadas para `auth.uid()` sendo re-avaliadas para cada linha
- **Tabelas afetadas**: `public.barbearias`, `public.audit_logs`
- **Políticas afetadas**: 
  - "Admins podem excluir barbearias"
  - "Admins podem atualizar barbearias"
  - "Admins podem ver todos os logs de auditoria"
  - "Admins podem inserir logs de auditoria"

### 2. Multiple Permissive Policies Warnings
- **Problema**: Múltiplas políticas permissivas para o mesmo role/action
- **Tabela afetada**: `public.barbearias`
- **Ação**: UPDATE
- **Roles afetados**: anon, authenticated, authenticator, dashboard_user

## Correções Aplicadas

### Migração 1: `20250730000000_fix_rls_performance_warnings.sql`

#### 1. Otimização de Chamadas auth.uid()

**Antes:**
```sql
CREATE POLICY "Admins podem excluir barbearias"
ON public.barbearias
FOR DELETE
USING (
  auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);
```

**Depois:**
```sql
CREATE POLICY "Admins podem excluir barbearias"
ON public.barbearias
FOR DELETE
USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);
```

#### 2. Consolidação de Políticas Múltiplas

**Antes:**
```sql
-- Política 1
CREATE POLICY "Admins podem atualizar barbearias"
ON public.barbearias FOR UPDATE
USING (auth.uid() IN (SELECT usuario_auth_id FROM public.admins));

-- Política 2
CREATE POLICY "Barbearias podem atualizar seus próprios dados"
ON public.barbearias FOR UPDATE
USING (auth.uid() = usuario_auth_id);
```

**Depois:**
```sql
-- Política consolidada
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
```

### Migração 2: `20250730000001_final_rls_optimization.sql`

#### 1. Otimização de Funções de Auditoria

**Antes:**
```sql
v_user_id := auth.uid();
```

**Depois:**
```sql
v_user_id := (select auth.uid());
```

#### 2. Verificação de Políticas Restantes

Garantiu que todas as políticas restantes usem a sintaxe otimizada.

## Benefícios das Correções

### 1. Performance Melhorada
- **Redução de overhead**: Função `auth.uid()` não é mais re-avaliada para cada linha
- **Consultas mais rápidas**: Especialmente em tabelas com muitas linhas
- **Menos uso de CPU**: Avaliação de políticas mais eficiente

### 2. Eliminação de Warnings
- **Auth RLS Initialization Plan**: Todos os warnings eliminados
- **Multiple Permissive Policies**: Políticas consolidadas
- **Código mais limpo**: Menos redundância nas políticas

### 3. Manutenção da Segurança
- **Funcionalidade preservada**: Todas as regras de segurança mantidas
- **Controle de acesso**: Admins e barbearias mantêm seus privilégios
- **Auditoria**: Logs de auditoria continuam funcionando

## Como Aplicar as Correções

### Opção 1: Script Automático
```powershell
.\apply_rls_fixes.ps1
```

### Opção 2: Manual
```bash
# Aplicar migrações
supabase db push

# Verificar warnings restantes
supabase db lint
```

## Verificação das Correções

### 1. Verificar Warnings
```bash
supabase db lint
```

### 2. Testar Funcionalidade
- Login como admin e verificar acesso às barbearias
- Login como barbearia e verificar acesso aos próprios dados
- Verificar se os logs de auditoria estão sendo criados

### 3. Monitorar Performance
- Observar tempo de resposta das consultas
- Verificar uso de CPU durante operações
- Monitorar logs de performance

## Estrutura das Políticas Após Correção

### Tabela `barbearias`
```sql
-- Leitura pública
CREATE POLICY "Permitir leitura pública de barbearias" 
ON public.barbearias FOR SELECT TO anon, authenticated USING (true);

-- Atualização consolidada
CREATE POLICY "Acesso de atualização consolidado para barbearias"
ON public.barbearias FOR UPDATE USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
  OR (select auth.uid()) = usuario_auth_id
);

-- Exclusão (apenas admins)
CREATE POLICY "Admins podem excluir barbearias"
ON public.barbearias FOR DELETE USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);
```

### Tabela `audit_logs`
```sql
-- Visualização (apenas admins)
CREATE POLICY "Admins podem ver todos os logs de auditoria"
ON public.audit_logs FOR SELECT USING (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);

-- Inserção (apenas admins)
CREATE POLICY "Admins podem inserir logs de auditoria"
ON public.audit_logs FOR INSERT WITH CHECK (
  (select auth.uid()) IN (SELECT usuario_auth_id FROM public.admins)
);
```

## Próximos Passos

1. **Monitorar**: Acompanhar performance após aplicação
2. **Testar**: Verificar todas as funcionalidades
3. **Documentar**: Atualizar documentação da API
4. **Treinar**: Informar equipe sobre as mudanças

## Referências

- [Supabase RLS Performance Guide](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Database Linter Documentation](https://supabase.com/docs/guides/database/database-linter)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security) 