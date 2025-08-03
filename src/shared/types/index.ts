// Core Domain Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'barbearia' | 'cliente';
  created_at: string;
  updated_at: string;
}

export interface Barbearia {
  id: string;
  nome: string;
  slug: string;
  endereco: string;
  telefone: string;
  email: string;
  logo_url?: string;
  theme_color: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  barbearia_id: string;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  pontos: number;
  nivel_fidelidade: string;
  data_nascimento?: string;
  endereco?: string;
  created_at: string;
  updated_at: string;
}

export interface NivelFidelidade {
  id: string;
  barbearia_id: string;
  nome: string;
  pontos_necessarios: number;
  desconto_percentual: number;
  cor: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Recompensa {
  id: string;
  barbearia_id: string;
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  valor_desconto?: number;
  tipo: 'desconto' | 'produto' | 'servico';
  ativa: boolean;
  quantidade_limite?: number;
  validade?: string;
  created_at: string;
  updated_at: string;
}

export interface Transacao {
  id: string;
  cliente_id: string;
  barbearia_id: string;
  tipo: 'ganho' | 'resgate';
  pontos: number;
  descricao: string;
  valor_servico?: number;
  servicos?: string[];
  recompensa_id?: string;
  funcionario_id?: string;
  created_at: string;
}

// UI/State Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormState<T> extends LoadingState {
  data: T;
  isDirty: boolean;
  isValid: boolean;
}

// Mobile/PWA Types
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  platform: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export interface PWAInstallPrompt {
  isInstallable: boolean;
  deferredPrompt?: BeforeInstallPromptEvent | null;
}

// Navigation Types
export type Role = 'admin' | 'barbearia' | 'cliente';

export interface RouteConfig {
  path: string;
  element: JSX.Element;
  role?: Role;
  preload?: boolean;
}

// Feature-specific Types
export interface QRCodeData {
  clienteId: string;
  barbeariaId: string;
  timestamp: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}