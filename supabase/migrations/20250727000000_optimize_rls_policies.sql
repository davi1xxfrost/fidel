-- Otimizando Políticas de Segurança em Nível de Linha (RLS) para melhorar a performance

-- Tabela: public.barbearias
-- Removendo políticas antigas
DROP POLICY IF EXISTS "Barbearias podem atualizar seus próprios dados" ON public.barbearias;
DROP POLICY IF EXISTS "Barbearias podem ver seus próprios dados" ON public.barbearias;
DROP POLICY IF EXISTS "Admin pode inserir barbearias" ON public.barbearias;

-- Recriando políticas com performance otimizada
CREATE POLICY "Barbearias podem atualizar seus próprios dados" ON public.barbearias FOR UPDATE USING ((select auth.uid()) = usuario_auth_id);
CREATE POLICY "Barbearias podem ver seus próprios dados" ON public.barbearias FOR SELECT USING ((select auth.uid()) = usuario_auth_id);
CREATE POLICY "Admin pode inserir barbearias" ON public.barbearias FOR INSERT WITH CHECK (true);

-- Tabela: public.transacoes_pontos
-- Removendo políticas antigas
DROP POLICY IF EXISTS "Barbearias podem ver suas transações" ON public.transacoes_pontos;
DROP POLICY IF EXISTS "Barbearias podem criar transações" ON public.transacoes_pontos;
DROP POLICY IF EXISTS "Barbearia só vê suas transações" ON public.transacoes_pontos;

-- Recriando políticas com performance otimizada
CREATE POLICY "Barbearias podem ver suas transações" ON public.transacoes_pontos FOR SELECT USING (true);
CREATE POLICY "Barbearias podem criar transações" ON public.transacoes_pontos FOR INSERT WITH CHECK (true);
CREATE POLICY "Barbearia só vê suas transações" ON public.transacoes_pontos FOR SELECT USING (barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid())));

-- Tabela: public.clientes
-- Removendo políticas antigas
DROP POLICY IF EXISTS "Cliente pode ver/editar seus próprios dados" ON public.clientes;
DROP POLICY IF EXISTS "Barbearia pode ver/editar seus clientes" ON public.clientes;
DROP POLICY IF EXISTS "Barbearia só vê seus clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admin pode tudo em clientes" ON public.clientes;

-- Recriando políticas com performance otimizada
CREATE POLICY "Cliente pode ver/editar seus próprios dados" ON public.clientes FOR ALL USING ((select auth.uid()) = id);
CREATE POLICY "Barbearia pode ver/editar seus clientes" ON public.clientes FOR ALL USING (barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid())));
CREATE POLICY "Barbearia só vê seus clientes" ON public.clientes FOR SELECT USING (barbearia_id IN (SELECT id FROM public.barbearias WHERE usuario_auth_id = (select auth.uid())));
CREATE POLICY "Admin pode tudo em clientes" ON public.clientes FOR ALL USING (true);

-- Tabela: public.admins
-- Removendo política antiga
DROP POLICY IF EXISTS "Allow authenticated users to read admins table" ON public.admins;

-- Recriando política com performance otimizada
CREATE POLICY "Allow authenticated users to read admins table" ON public.admins FOR SELECT USING ((select auth.role()) = 'authenticated');