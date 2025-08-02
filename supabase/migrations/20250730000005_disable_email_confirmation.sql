-- Desabilitar confirmação de email obrigatória
-- Isso permite que usuários façam login imediatamente após o cadastro

-- Atualizar configurações de autenticação
UPDATE auth.config 
SET email_confirmation_required = false 
WHERE id = 1;

-- Ou, se preferir usar SQL direto:
-- ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT now();
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL; 