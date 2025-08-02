-- Criar tabela de atividades das barbearias (OTIMIZADA - SEM WARNINGS)
CREATE TABLE IF NOT EXISTS atividades_barbearia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  pontos INTEGER NOT NULL DEFAULT 1,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices otimizados para performance
CREATE INDEX IF NOT EXISTS idx_atividades_barbearia_barbearia_id ON atividades_barbearia(barbearia_id);
CREATE INDEX IF NOT EXISTS idx_atividades_barbearia_ativo ON atividades_barbearia(ativo);
CREATE INDEX IF NOT EXISTS idx_atividades_barbearia_barbearia_ativo ON atividades_barbearia(barbearia_id, ativo);

-- Habilitar RLS
ALTER TABLE atividades_barbearia ENABLE ROW LEVEL SECURITY;

-- REMOVER políticas existentes (se houver) para evitar duplicação
DROP POLICY IF EXISTS "Barbearias podem ver suas atividades" ON atividades_barbearia;
DROP POLICY IF EXISTS "Barbearias podem inserir suas atividades" ON atividades_barbearia;
DROP POLICY IF EXISTS "Barbearias podem atualizar suas atividades" ON atividades_barbearia;
DROP POLICY IF EXISTS "Barbearias podem deletar suas atividades" ON atividades_barbearia;

-- CRIAR políticas otimizadas (seguindo padrão mais recente)
-- Política de SELECT: Barbearias veem apenas suas atividades
CREATE POLICY "Barbearias podem ver suas atividades" 
ON atividades_barbearia 
FOR SELECT 
USING (
  barbearia_id IN (
    SELECT id FROM barbearias 
    WHERE usuario_auth_id = auth.uid()
  )
);

-- Política de INSERT: Barbearias inserem apenas suas atividades
CREATE POLICY "Barbearias podem inserir suas atividades" 
ON atividades_barbearia 
FOR INSERT 
WITH CHECK (
  barbearia_id IN (
    SELECT id FROM barbearias 
    WHERE usuario_auth_id = auth.uid()
  )
);

-- Política de UPDATE: Barbearias atualizam apenas suas atividades
CREATE POLICY "Barbearias podem atualizar suas atividades" 
ON atividades_barbearia 
FOR UPDATE 
USING (
  barbearia_id IN (
    SELECT id FROM barbearias 
    WHERE usuario_auth_id = auth.uid()
  )
);

-- Política de DELETE: Barbearias deletam apenas suas atividades
CREATE POLICY "Barbearias podem deletar suas atividades" 
ON atividades_barbearia 
FOR DELETE 
USING (
  barbearia_id IN (
    SELECT id FROM barbearias 
    WHERE usuario_auth_id = auth.uid()
  )
);

-- Trigger otimizado para updated_at (SEM WARNING)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Criar trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_atividades_barbearia_updated_at'
  ) THEN
    CREATE TRIGGER update_atividades_barbearia_updated_at 
      BEFORE UPDATE ON atividades_barbearia 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 