-- Adicionar coluna slug à tabela barbearias
ALTER TABLE public.barbearias 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Criar função para gerar slug a partir do nome da barbearia
CREATE OR REPLACE FUNCTION generate_slug(nome TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  final_slug TEXT;
BEGIN
  -- Converter para minúsculas, remover acentos e caracteres especiais
  slug := lower(unaccent(nome));
  -- Substituir espaços e caracteres especiais por hífens
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  -- Remover hífens no início e fim
  slug := trim(both '-' from slug);
  
  final_slug := slug;
  
  -- Verificar se já existe e adicionar número se necessário
  WHILE EXISTS (SELECT 1 FROM public.barbearias WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Atualizar slugs existentes
UPDATE public.barbearias 
SET slug = generate_slug(nome_barbearia) 
WHERE slug IS NULL;

-- Criar trigger para gerar slug automaticamente
CREATE OR REPLACE FUNCTION set_barbearia_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.nome_barbearia);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_set_barbearia_slug ON public.barbearias;
CREATE TRIGGER trigger_set_barbearia_slug
  BEFORE INSERT OR UPDATE ON public.barbearias
  FOR EACH ROW
  EXECUTE FUNCTION set_barbearia_slug();

-- Atualizar a função get_barbearia_by_slug para usar a coluna slug
CREATE OR REPLACE FUNCTION get_barbearia_by_slug(p_slug TEXT)
RETURNS TABLE(id UUID, nome_barbearia TEXT, email_contato TEXT, slug TEXT) 
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.nome_barbearia, b.email_contato, b.slug
  FROM barbearias b
  WHERE b.slug = p_slug;
END; 
$$ LANGUAGE plpgsql; 