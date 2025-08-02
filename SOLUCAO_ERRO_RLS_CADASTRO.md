# Solução para Erro de RLS no Cadastro de Clientes

## Problema Identificado

O erro `"new row violates row-level security policy for table "clientes"` estava ocorrendo porque:

1. **Usuário não autenticado**: O `signUp()` do Supabase cria o usuário no Auth, mas não faz login automático
2. **Política RLS restritiva**: As políticas RLS exigem que `auth.uid()` retorne um valor válido
3. **Tentativa de inserção sem autenticação**: A inserção na tabela `clientes` estava sendo feita sem o usuário estar autenticado

## Solução Implementada

### 1. Login Automático Após Cadastro

Adicionei login automático após o `signUp()` em dois arquivos:

#### `src/pages/BarbeariaCadastro.tsx`
```typescript
// 1. Criar usuário no Auth
const { data, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: { 
    data: { 
      tipo: "cliente",
      nome_completo: nome
    } 
  }
});

// 1.5. Fazer login automático para garantir autenticação
const { error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (signInError) {
  console.error('Erro no login automático:', signInError);
  setError("Erro ao fazer login automático. Tente fazer login manualmente.");
  return;
}
```

#### `src/pages/ClienteAuth.tsx`
```typescript
// 1. Cria usuário no Auth
const { data, error } = await supabase.auth.signUp({
  email,
  password: senha,
  options: { data: { tipo: "cliente" } }
});

// 1.5. Fazer login automático para garantir autenticação
const { error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password: senha
});

if (signInError) {
  toast({
    title: "Erro no login automático",
    description: "Tente fazer login manualmente",
    status: "error"
  });
  setLoading(false);
  return;
}
```

### 2. Fluxo Corrigido

1. **Criar usuário** com `signUp()`
2. **Fazer login automático** com `signInWithPassword()`
3. **Gerar QR Code ID**
4. **Inserir na tabela clientes** (agora com usuário autenticado)

## Verificação da Solução

### Script de Teste
Criei um script de teste (`test_cadastro_cliente.js`) que pode ser executado no console do navegador para verificar se o cadastro está funcionando.

### Como Testar

1. Navegue para a página de cadastro
2. Abra o console do navegador (F12)
3. Execute o script de teste
4. Preencha os dados e tente cadastrar
5. Verifique se não há mais erros de RLS

## Políticas RLS Existentes

As políticas RLS já estavam corretas no arquivo `20250730000004_fix_client_registration_rls.sql`:

```sql
-- Política para permitir inserção pública (para cadastro inicial)
CREATE POLICY "Permitir cadastro público de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);
```

O problema era que mesmo com essa política, o Supabase ainda verifica se o usuário está autenticado quando há outras políticas que dependem de `auth.uid()`.

## Resultado

Com essas correções, o cadastro de clientes deve funcionar corretamente sem erros de RLS. O usuário será automaticamente autenticado após o cadastro, permitindo que a inserção na tabela `clientes` seja realizada com sucesso. 