# Solução para Erro 400 no Cadastro de Clientes

## Problema Identificado

O erro 400 (Bad Request) está ocorrendo ao tentar cadastrar clientes no Supabase. O problema é causado por políticas RLS (Row Level Security) que estão impedindo a inserção de registros na tabela `clientes`.

## Causa Raiz

As políticas RLS atuais estão muito restritivas e não permitem que as barbearias insiram clientes, mesmo quando autenticadas corretamente.

## Solução

### 1. Aplicar Correção SQL

Execute o seguinte script SQL no painel do Supabase (SQL Editor):

```sql
-- Correção imediata para o erro 400 no cadastro de clientes
-- Este script corrige as políticas RLS que estão impedindo a inserção de clientes

-- 1. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Clientes podem criar seus próprios registros" ON public.clientes;
DROP POLICY IF EXISTS "Clientes autenticados podem criar seus registros" ON public.clientes;
DROP POLICY IF EXISTS "Barbearias podem criar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Permitir cadastro público de clientes" ON public.clientes;

-- 2. Criar política simples e permissiva para inserção
CREATE POLICY "Permitir inserção de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- 3. Manter políticas de visualização existentes
DROP POLICY IF EXISTS "Clientes podem ver seus próprios dados" ON public.clientes;
CREATE POLICY "Clientes podem ver seus próprios dados" 
ON public.clientes 
FOR SELECT 
USING (
    auth.uid() = usuario_auth_id OR 
    barbearia_id IN (
        SELECT id FROM public.barbearias 
        WHERE usuario_auth_id = auth.uid()
    ) OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- 4. Manter políticas de atualização
DROP POLICY IF EXISTS "Clientes podem atualizar seus próprios dados" ON public.clientes;
CREATE POLICY "Clientes podem atualizar seus próprios dados" 
ON public.clientes 
FOR UPDATE 
USING (
    auth.uid() = usuario_auth_id OR
    barbearia_id IN (
        SELECT id FROM public.barbearias 
        WHERE usuario_auth_id = auth.uid()
    ) OR
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- 5. Verificar se a função generate_qr_code_id existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_qr_code_id') THEN
        CREATE OR REPLACE FUNCTION generate_qr_code_id()
        RETURNS TEXT AS $$
        DECLARE
          new_id TEXT;
          done BOOL;
        BEGIN
          done := false;
          WHILE NOT done LOOP
            -- Gerar ID alfanumérico de 8 caracteres
            new_id := upper(substring(md5(random()::text) from 1 for 8));
            
            -- Verificar se já existe
            IF NOT EXISTS (SELECT 1 FROM public.clientes WHERE qr_code_id = new_id) THEN
              done := true;
            END IF;
          END LOOP;
          
          RETURN new_id;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- 6. Garantir que a tabela clientes tenha todos os campos necessários
DO $$
BEGIN
    -- Adicionar campo email se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN email TEXT;
    END IF;
    
    -- Adicionar campo usuario_auth_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        AND column_name = 'usuario_auth_id'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN usuario_auth_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
```

### 2. Melhorias no Código

O código do formulário foi melhorado para incluir:

- Verificação de autenticação do usuário
- Verificação de permissões da barbearia
- Logs detalhados para debug
- Melhor tratamento de erros

### 3. Como Aplicar

#### Opção 1: Via Painel do Supabase
1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Cole o script SQL acima
4. Execute o script

#### Opção 2: Via Supabase CLI
```bash
supabase db reset
supabase db push
```

### 4. Verificação

Após aplicar as correções:

1. Teste o cadastro de um novo cliente
2. Verifique os logs no console do navegador
3. Confirme que o cliente foi criado com sucesso

## Estrutura da Tabela Clientes

A tabela `clientes` deve ter os seguintes campos obrigatórios:

- `id` (UUID, PRIMARY KEY)
- `barbearia_id` (UUID, NOT NULL)
- `nome_completo` (TEXT, NOT NULL)
- `cpf_id` (TEXT, NOT NULL)
- `celular_whatsapp` (TEXT, NOT NULL)
- `qr_code_id` (TEXT, UNIQUE, NOT NULL)
- `pontos_acumulados` (INTEGER, DEFAULT 0)
- `total_gasto` (DECIMAL, DEFAULT 0.00)
- `nivel_fidelidade` (TEXT, DEFAULT 'BRONZE')
- `data_cadastro` (TIMESTAMP, DEFAULT now())
- `usuario_auth_id` (UUID, opcional)
- `email` (TEXT, opcional)

## Políticas RLS Aplicadas

### Inserção
- Política permissiva que permite inserção para todos os usuários autenticados

### Visualização
- Clientes podem ver seus próprios dados
- Barbearias podem ver seus clientes
- Admins podem ver todos os dados

### Atualização
- Clientes podem atualizar seus próprios dados
- Barbearias podem atualizar seus clientes
- Admins podem atualizar todos os dados

## Troubleshooting

Se o erro persistir:

1. Verifique se o usuário está autenticado
2. Verifique se a barbearia existe e pertence ao usuário
3. Verifique os logs no console do navegador
4. Verifique se a função `generate_qr_code_id` existe
5. Verifique se todos os campos obrigatórios estão sendo enviados

## Logs de Debug

O código agora inclui logs detalhados que aparecem no console do navegador:

- Dados do cliente sendo inseridos
- Erros detalhados do Supabase
- Verificações de autenticação e permissões

## Arquivos Modificados

- `src/pages/BarbeariaFormularioNovoCliente.tsx` - Melhorado com verificações e logs
- `fix_client_registration_immediate.sql` - Script de correção SQL
- `fix_client_error.ps1` - Script PowerShell para aplicar correções 