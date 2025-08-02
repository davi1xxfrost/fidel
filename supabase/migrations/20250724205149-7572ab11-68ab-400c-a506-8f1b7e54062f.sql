-- Atualizar função generate_qr_code_id com search_path seguro
CREATE OR REPLACE FUNCTION generate_qr_code_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Atualizar função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;