-- Adicionar política de DELETE para administradores na tabela barbearias

-- Política para permitir que admins excluam barbearias
CREATE POLICY "Admins podem excluir barbearias"
ON public.barbearias
FOR DELETE
USING (
  auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Política para permitir que admins atualizem barbearias
CREATE POLICY "Admins podem atualizar barbearias"
ON public.barbearias
FOR UPDATE
USING (
  auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
); 