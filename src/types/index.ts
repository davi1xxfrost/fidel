// Tipos customizados para o projeto
export interface Barbearia {
  id: string;
  nome_barbearia: string;
  email_contato: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  usuario_auth_id?: string | null;
}

export interface Cliente {
  id: string;
  nome_completo: string;
  celular_whatsapp: string;
  cpf_id: string;
  barbearia_id: string;
  nivel_fidelidade: string;
  pontos_acumulados: number;
  total_gasto: number;
  qr_code_id: string;
  data_cadastro: string;
  usuario_auth_id?: string | null;
}

export interface NivelFidelidade {
  id: string;
  nome_nivel: string | null;
  valor_pontos: number | null;
  barbearia_id: string | null;
}

export interface Recompensa {
  id: string;
  descricao: string | null;
  valor_pontos: number | null;
  barbearia_id: string | null;
  cliente_id: string | null;
  data_resgate: string | null;
}

export interface TransacaoPontos {
  id: string;
  barbearia_id: string;
  cliente_id: string;
  tipo: string;
  valor_pontos: number;
  valor_monetario_em_centavos: number | null;
  descricao: string | null;
  data_transacao: string;
}

export interface Admin {
  usuario_auth_id: string;
}

// Tipos para formulários
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CadastroClienteFormData {
  nome_completo: string;
  celular_whatsapp: string;
  cpf: string;
  email: string;
  password: string;
}

export interface NovoClienteFormData {
  nome_completo: string;
  celular_whatsapp: string;
  cpf: string;
}

// Tipos para estados de loading
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Tipos para filtros
export interface ClienteFilters {
  search?: string;
  nivel_fidelidade?: string;
  data_inicio?: string;
  data_fim?: string;
}

// Tipos para estatísticas
export interface BarbeariaStats {
  total_clientes: number;
  total_pontos_distribuidos: number;
  total_recompensas_resgatadas: number;
  faturamento_mensal: number;
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos para configurações
export interface AppConfig {
  max_pontos_por_compra: number;
  pontos_por_real: number;
  niveis_fidelidade: NivelFidelidade[];
}