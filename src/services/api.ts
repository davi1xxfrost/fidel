import { supabase } from '@/integrations/supabase/client';
import type { 
  Barbearia, 
  Cliente, 
  NivelFidelidade, 
  Recompensa, 
  TransacaoPontos,
  PaginationParams,
  ClienteFilters 
} from '@/types';
import { PAGINATION_CONFIG } from '@/constants';

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  error: string | null;
}

// Serviços para Barbearias
export const barbeariaService = {
  async getBySlug(slug: string): Promise<ApiResponse<Barbearia>> {
    try {
      const { data, error } = await supabase
        .from('barbearias')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao buscar barbearia' };
    }
  },

  async getById(id: string): Promise<ApiResponse<Barbearia>> {
    try {
      const { data, error } = await supabase
        .from('barbearias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao buscar barbearia' };
    }
  },

  async update(id: string, updates: Partial<Barbearia>): Promise<ApiResponse<Barbearia>> {
    try {
      const { data, error } = await supabase
        .from('barbearias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao atualizar barbearia' };
    }
  },
};

// Serviços para Clientes
export const clienteService = {
  async getByBarbearia(
    barbeariaId: string, 
    params: PaginationParams = { page: 1, limit: PAGINATION_CONFIG.defaultLimit, offset: 0 },
    filters?: ClienteFilters
  ): Promise<ApiPaginatedResponse<Cliente>> {
    try {
      let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .eq('barbearia_id', barbeariaId)
        .range(params.offset, params.offset + params.limit - 1)
        .order('data_cadastro', { ascending: false });

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(`nome_completo.ilike.%${filters.search}%,celular_whatsapp.ilike.%${filters.search}%`);
      }

      if (filters?.nivel_fidelidade) {
        query = query.eq('nivel_fidelidade', filters.nivel_fidelidade);
      }

      if (filters?.data_inicio) {
        query = query.gte('data_cadastro', filters.data_inicio);
      }

      if (filters?.data_fim) {
        query = query.lte('data_cadastro', filters.data_fim);
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: [], total: 0, page: params.page, limit: params.limit, hasMore: false, error: error.message };
      }

      const total = count || 0;
      const hasMore = params.offset + params.limit < total;

      return { 
        data: data || [], 
        total, 
        page: params.page, 
        limit: params.limit, 
        hasMore, 
        error: null 
      };
    } catch {
      return { 
        data: [], 
        total: 0, 
        page: params.page, 
        limit: params.limit, 
        hasMore: false, 
        error: 'Erro ao buscar clientes' 
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Cliente>> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao buscar cliente' };
    }
  },

  async create(cliente: Omit<Cliente, 'id' | 'data_cadastro'>): Promise<ApiResponse<Cliente>> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao criar cliente' };
    }
  },

  async update(id: string, updates: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao atualizar cliente' };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch {
      return { data: null, error: 'Erro ao deletar cliente' };
    }
  },
};

// Serviços para Transações
export const transacaoService = {
  async getByCliente(clienteId: string): Promise<ApiResponse<TransacaoPontos[]>> {
    try {
      const { data, error } = await supabase
        .from('transacoes_pontos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data_transacao', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch {
      return { data: null, error: 'Erro ao buscar transações' };
    }
  },

  async create(transacao: Omit<TransacaoPontos, 'id'>): Promise<ApiResponse<TransacaoPontos>> {
    try {
      const { data, error } = await supabase
        .from('transacoes_pontos')
        .insert(transacao)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao criar transação' };
    }
  },
};

// Serviços para Recompensas
export const recompensaService = {
  async getByBarbearia(barbeariaId: string): Promise<ApiResponse<Recompensa[]>> {
    try {
      const { data, error } = await supabase
        .from('recompensas')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .is('cliente_id', null);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch {
      return { data: null, error: 'Erro ao buscar recompensas' };
    }
  },

  async resgatar(recompensaId: string, clienteId: string): Promise<ApiResponse<Recompensa>> {
    try {
      const { data, error } = await supabase
        .from('recompensas')
        .update({ 
          cliente_id: clienteId, 
          data_resgate: new Date().toISOString() 
        })
        .eq('id', recompensaId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro ao resgatar recompensa' };
    }
  },
};

// Serviços para Níveis de Fidelidade
export const nivelFidelidadeService = {
  async getByBarbearia(barbeariaId: string): Promise<ApiResponse<NivelFidelidade[]>> {
    try {
      const { data, error } = await supabase
        .from('niveis_fidelidade')
        .select('*')
        .eq('barbearia_id', barbeariaId)
        .order('valor_pontos', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch {
      return { data: null, error: 'Erro ao buscar níveis de fidelidade' };
    }
  },
};

// Serviço de autenticação
export const authService = {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    return await supabase.auth.getUser();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },
};