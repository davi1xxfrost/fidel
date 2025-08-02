-- Criar tabela de barbearias
CREATE TABLE public.barbearias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_barbearia TEXT NOT NULL,
  email_contato TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbearia_id UUID NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cpf_id TEXT NOT NULL,
  celular_whatsapp TEXT NOT NULL,
  pontos_acumulados INTEGER NOT NULL DEFAULT 0,
  qr_code_id TEXT UNIQUE NOT NULL,
  total_gasto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  nivel_fidelidade TEXT NOT NULL DEFAULT 'BRONZE',
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Garantir que CPF/ID seja único por barbearia
  UNIQUE(barbearia_id, cpf_id)
);

-- Criar tabela de transações de pontos
CREATE TABLE public.transacoes_pontos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  barbearia_id UUID NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('GANHO', 'RESGATE')),
  valor_pontos INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  data_transacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valor_monetario_associado DECIMAL(10,2)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.barbearias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_pontos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para barbearias (acesso apenas aos próprios dados)
CREATE POLICY "Barbearias podem ver seus próprios dados" 
ON public.barbearias 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Barbearias podem atualizar seus próprios dados" 
ON public.barbearias 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Políticas RLS para clientes (cada barbearia vê apenas seus clientes)
CREATE POLICY "Barbearias podem ver seus clientes" 
ON public.clientes 
FOR SELECT 
USING (auth.uid()::text = barbearia_id::text);

CREATE POLICY "Barbearias podem criar clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid()::text = barbearia_id::text);

CREATE POLICY "Barbearias podem atualizar seus clientes" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid()::text = barbearia_id::text);

-- Políticas RLS para transações (cada barbearia vê apenas suas transações)
CREATE POLICY "Barbearias podem ver suas transações" 
ON public.transacoes_pontos 
FOR SELECT 
USING (auth.uid()::text = barbearia_id::text);

CREATE POLICY "Barbearias podem criar transações" 
ON public.transacoes_pontos 
FOR INSERT 
WITH CHECK (auth.uid()::text = barbearia_id::text);

-- Função para gerar QR Code ID único
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

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_barbearias_updated_at
  BEFORE UPDATE ON public.barbearias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_clientes_barbearia_id ON public.clientes(barbearia_id);
CREATE INDEX idx_clientes_qr_code_id ON public.clientes(qr_code_id);
CREATE INDEX idx_transacoes_cliente_id ON public.transacoes_pontos(cliente_id);
CREATE INDEX idx_transacoes_barbearia_id ON public.transacoes_pontos(barbearia_id);
CREATE INDEX idx_transacoes_data ON public.transacoes_pontos(data_transacao);