-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id),
    usuario_email TEXT,
    acao TEXT NOT NULL,
    tabela TEXT NOT NULL,
    registro_id TEXT,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    nivel TEXT NOT NULL DEFAULT 'INFO' CHECK (nivel IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario_id ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON public.audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON public.audit_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_logs_nivel ON public.audit_logs(nivel);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_logs
-- Admins podem ver todos os logs
CREATE POLICY "Admins podem ver todos os logs de auditoria"
ON public.audit_logs FOR SELECT
USING (
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Admins podem inserir logs
CREATE POLICY "Admins podem inserir logs de auditoria"
ON public.audit_logs FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT usuario_auth_id FROM public.admins)
);

-- Função para inserir log de auditoria
CREATE OR REPLACE FUNCTION public.insert_audit_log(
    p_acao TEXT,
    p_tabela TEXT,
    p_registro_id TEXT DEFAULT NULL,
    p_dados_anteriores JSONB DEFAULT NULL,
    p_dados_novos JSONB DEFAULT NULL,
    p_nivel TEXT DEFAULT 'INFO',
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
    v_user_id UUID;
    v_user_email TEXT;
    v_ip_address INET;
    v_user_agent TEXT;
BEGIN
    -- Obter dados do usuário atual
    v_user_id := auth.uid();
    
    -- Obter email do usuário
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_user_id;
    
    -- Obter IP e User Agent (em produção, você pode extrair isso do contexto)
    v_ip_address := inet '127.0.0.1'; -- Placeholder
    v_user_agent := 'System'; -- Placeholder
    
    -- Inserir log
    INSERT INTO public.audit_logs (
        usuario_id,
        usuario_email,
        acao,
        tabela,
        registro_id,
        dados_anteriores,
        dados_novos,
        ip_address,
        user_agent,
        nivel,
        metadata
    ) VALUES (
        v_user_id,
        v_user_email,
        p_acao,
        p_tabela,
        p_registro_id,
        p_dados_anteriores,
        p_dados_novos,
        v_ip_address,
        v_user_agent,
        p_nivel,
        p_metadata
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Função para inserir alerta de segurança
CREATE OR REPLACE FUNCTION public.insert_security_alert(
    p_tipo TEXT,
    p_descricao TEXT,
    p_ip_address INET DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_alert_id UUID;
    v_user_id UUID;
BEGIN
    -- Obter usuário atual
    v_user_id := auth.uid();
    
    -- Inserir alerta (assumindo que você tem uma tabela security_alerts)
    -- Por enquanto, vamos inserir como um log de auditoria
    INSERT INTO public.audit_logs (
        usuario_id,
        usuario_email,
        acao,
        tabela,
        registro_id,
        nivel,
        metadata
    ) VALUES (
        v_user_id,
        (SELECT email FROM auth.users WHERE id = v_user_id),
        'SECURITY_ALERT',
        'security_alerts',
        p_tipo,
        'CRITICAL',
        jsonb_build_object(
            'tipo', p_tipo,
            'descricao', p_descricao,
            'ip_address', p_ip_address,
            'metadata', p_metadata
        )
    ) RETURNING id INTO v_alert_id;
    
    RETURN v_alert_id;
END;
$$;

-- Triggers para auditoria automática
-- Trigger para barbearias
CREATE OR REPLACE FUNCTION public.audit_barbearias_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.insert_audit_log(
            'CREATE',
            'barbearias',
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW),
            'INFO'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.insert_audit_log(
            'UPDATE',
            'barbearias',
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW),
            'INFO'
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.insert_audit_log(
            'DELETE',
            'barbearias',
            OLD.id::TEXT,
            to_jsonb(OLD),
            NULL,
            'WARNING'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER audit_barbearias
    AFTER INSERT OR UPDATE OR DELETE ON public.barbearias
    FOR EACH ROW EXECUTE FUNCTION public.audit_barbearias_trigger();

-- Trigger para clientes
CREATE OR REPLACE FUNCTION public.audit_clientes_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.insert_audit_log(
            'CREATE',
            'clientes',
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW),
            'INFO'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.insert_audit_log(
            'UPDATE',
            'clientes',
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW),
            'INFO'
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.insert_audit_log(
            'DELETE',
            'clientes',
            OLD.id::TEXT,
            to_jsonb(OLD),
            NULL,
            'WARNING'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER audit_clientes
    AFTER INSERT OR UPDATE OR DELETE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.audit_clientes_trigger();

-- Trigger para transações_pontos
CREATE OR REPLACE FUNCTION public.audit_transacoes_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.insert_audit_log(
            'CREATE',
            'transacoes_pontos',
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW),
            'INFO'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.insert_audit_log(
            'UPDATE',
            'transacoes_pontos',
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW),
            'INFO'
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.insert_audit_log(
            'DELETE',
            'transacoes_pontos',
            OLD.id::TEXT,
            to_jsonb(OLD),
            NULL,
            'WARNING'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER audit_transacoes
    AFTER INSERT OR UPDATE OR DELETE ON public.transacoes_pontos
    FOR EACH ROW EXECUTE FUNCTION public.audit_transacoes_trigger(); 