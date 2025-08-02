import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/types/supabase-types";

export interface AuditLogData {
  acao: string;
  tabela: string;
  registro_id?: string;
  dados_anteriores?: Json;
  dados_novos?: Json;
  nivel?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Json;
}

export interface SecurityAlertData {
  tipo: 'LOGIN_FALHA' | 'ACESSO_NAO_AUTORIZADO' | 'DADOS_SENSIVEIS' | 'MUITAS_TENTATIVAS';
  descricao: string;
  ip_address?: string;
  metadata?: Json;
}

export const useAudit = () => {
  // Inserir log de auditoria
  const insertAuditLog = useCallback(async (data: AuditLogData) => {
    try {
      const { error } = await supabase.rpc('insert_audit_log', {
        p_acao: data.acao,
        p_tabela: data.tabela,
        p_registro_id: data.registro_id,
        p_dados_anteriores: data.dados_anteriores,
        p_dados_novos: data.dados_novos,
        p_nivel: data.nivel || 'INFO',
        p_metadata: data.metadata
      });

      if (error) {
        // Log silencioso para evitar console.error
        return false;
      }

      return true;
    } catch (_error) {
      // Log silencioso para evitar console.error
      return false;
    }
  }, []);

  // Inserir alerta de segurança
  const insertSecurityAlert = useCallback(async (data: SecurityAlertData) => {
    try {
      const { error } = await supabase.rpc('insert_security_alert', {
        p_tipo: data.tipo,
        p_descricao: data.descricao,
        p_ip_address: data.ip_address,
        p_metadata: data.metadata
      });

      if (error) {
        // Log silencioso para evitar console.error
        return false;
      }

      return true;
    } catch (_error) {
      // Log silencioso para evitar console.error
      return false;
    }
  }, []);

  // Buscar logs de auditoria
  const fetchAuditLogs = useCallback(async (filtros?: {
    acao?: string;
    tabela?: string;
    nivel?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtros?.acao) {
        query = query.eq('acao', filtros.acao);
      }

      if (filtros?.tabela) {
        query = query.eq('tabela', filtros.tabela);
      }

      if (filtros?.nivel) {
        query = query.eq('nivel', filtros.nivel);
      }

      if (filtros?.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }

      if (filtros?.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      if (filtros?.limit) {
        query = query.limit(filtros.limit);
      }

      if (filtros?.offset) {
        query = query.range(filtros.offset, filtros.offset + (filtros.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        // Log silencioso para evitar console.error
        return null;
      }

      return data;
    } catch (_error) {
      // Log silencioso para evitar console.error
      return null;
    }
  }, []);

  // Buscar alertas de segurança
  const fetchSecurityAlerts = useCallback(async (filtros?: {
    tipo?: string;
    resolvido?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('acao', 'SECURITY_ALERT')
        .order('created_at', { ascending: false });

      if (filtros?.tipo) {
        query = query.eq('registro_id', filtros.tipo);
      }

      if (filtros?.limit) {
        query = query.limit(filtros.limit);
      }

      if (filtros?.offset) {
        query = query.range(filtros.offset, filtros.offset + (filtros.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        // Log silencioso para evitar console.error
        return null;
      }

      return data;
    } catch (_error) {
      // Log silencioso para evitar console.error
      return null;
    }
  }, []);

  // Log automático para ações comuns
  const logAction = useCallback(async (
    acao: string,
    tabela: string,
    registro_id?: string,
    dados_anteriores?: Json,
    dados_novos?: Json,
    nivel: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'INFO'
  ) => {
    return await insertAuditLog({
      acao,
      tabela,
      registro_id,
      dados_anteriores,
      dados_novos,
      nivel
    });
  }, [insertAuditLog]);

  // Log de login
  const logLogin = useCallback(async (usuario_email: string, sucesso: boolean) => {
    const acao = sucesso ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
    const nivel = sucesso ? 'INFO' : 'WARNING';
    
    return await insertAuditLog({
      acao,
      tabela: 'auth',
      registro_id: usuario_email,
      nivel,
      metadata: { sucesso, timestamp: new Date().toISOString() }
    });
  }, [insertAuditLog]);

  // Log de logout
  const logLogout = useCallback(async (usuario_email: string) => {
    return await insertAuditLog({
      acao: 'LOGOUT',
      tabela: 'auth',
      registro_id: usuario_email,
      nivel: 'INFO',
      metadata: { timestamp: new Date().toISOString() }
    });
  }, [insertAuditLog]);

  // Log de acesso não autorizado
  const logUnauthorizedAccess = useCallback(async (rota: string, usuario_email?: string) => {
    return await insertSecurityAlert({
      tipo: 'ACESSO_NAO_AUTORIZADO',
      descricao: `Tentativa de acesso não autorizado à rota: ${rota}`,
      metadata: { rota, usuario_email, timestamp: new Date().toISOString() }
    });
  }, [insertSecurityAlert]);

  // Log de muitas tentativas de login
  const logMultipleLoginAttempts = useCallback(async (usuario_email: string, tentativas: number) => {
    return await insertSecurityAlert({
      tipo: 'MUITAS_TENTATIVAS',
      descricao: `Múltiplas tentativas de login para: ${usuario_email}`,
      metadata: { usuario_email, tentativas, timestamp: new Date().toISOString() }
    });
  }, [insertSecurityAlert]);

  return {
    insertAuditLog,
    insertSecurityAlert,
    fetchAuditLogs,
    fetchSecurityAlerts,
    logAction,
    logLogin,
    logLogout,
    logUnauthorizedAccess,
    logMultipleLoginAttempts
  };
}; 