# Solução para Erro 400 - CPF Duplicado

## Problema Identificado

O erro 400 estava ocorrendo porque o formulário de "Criar conta" **não tem campo CPF**, mas o código estava tentando inserir um CPF padrão `'000.000.000-00'` para todos os clientes.

Como existe uma constraint UNIQUE `(barbearia_id, cpf_id)` na tabela `clientes`, quando múltiplos clientes tentavam ser cadastrados com o mesmo CPF padrão, o banco rejeitava a inserção com erro 400.

## Formulários Afetados

### 1. Formulário "Criar conta" (BarbeariaCadastro.tsx)
**Campos presentes:**
- Nome completo
- Telefone  
- E-mail
- Senha
- Confirmar senha

**Campo CPF:** ❌ **NÃO EXISTE**

### 2. Formulário "Adicionar Novo Cliente" (BarbeariaFormularioNovoCliente.tsx)
**Campos presentes:**
- Nome completo
- CPF/ID ✅
- Celular (WhatsApp)

**Campo CPF:** ✅ **EXISTE**

## Solução Aplicada

### 1. Correção no Código

**Antes:**
```javascript
cpf_id: '000.000.000-00', // CPF Padrão
```

**Depois:**
```javascript
cpf_id: `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // CPF único baseado em timestamp
```

### 2. Arquivos Corrigidos

- `src/pages/BarbeariaCadastro.tsx` - Formulário "Criar conta"
- `src/pages/ClienteAuth.tsx` - Formulário de autenticação do cliente

### 3. Script SQL para Limpar Dados Existentes

Execute o script `fix_duplicate_cpfs.sql` no SQL Editor do Supabase para corrigir CPFs duplicados existentes.

## Como Aplicar a Correção

### Opção 1: Aplicar via Código (Recomendado)
Os arquivos já foram corrigidos. Faça deploy das alterações.

### Opção 2: Aplicar via SQL
Execute no SQL Editor do Supabase:

```sql
-- Atualizar CPFs duplicados existentes
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
```

## Verificação

Após aplicar as correções:

1. **Teste o cadastro** de uma nova conta
2. **Verifique no banco** se o CPF foi gerado corretamente
3. **Confirme** que não há mais erros 400

## Estrutura do CPF Gerado

O novo formato do CPF é:
```
CLI-{timestamp}-{random_string}
```

Exemplo: `CLI-1703123456789-abc12`

Isso garante que cada cliente tenha um CPF único, mesmo sem campo CPF no formulário.

## Observações

- O campo CPF continua sendo obrigatório no banco de dados
- Para formulários que não têm campo CPF, um valor único é gerado automaticamente
- Para formulários que têm campo CPF, o valor digitado pelo usuário é usado
- A constraint UNIQUE continua funcionando corretamente 