CREATE OR REPLACE FUNCTION get_barbearia_by_slug(p_slug TEXT)
RETURNS TABLE(id UUID) 
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT b.id
  FROM barbearias b
  WHERE lower(regexp_replace(b.nome, '\s+', '-', 'g')) = p_slug;
END; 
$$ LANGUAGE plpgsql;