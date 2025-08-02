// Configurações da aplicação
export const APP_CONFIG = {
  name: 'Fideliza',
  version: '1.0.0',
  description: 'Sistema de fidelidade para barbearias',
  author: 'Fideliza Team',
} as const;

// Configurações do Supabase
export const SUPABASE_CONFIG = {
  url: "https://osudrsvikewiyrubutko.supabase.co",
  anonKey: "sb_publishable_yok3BXSXZqSJFiK5CZTzww_-HSHsB5W",
} as const;

// Configurações de paginação
export const PAGINATION_CONFIG = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// Configurações de pontos
export const POINTS_CONFIG = {
  pontosPorReal: 1,
  maxPontosPorCompra: 1000,
  niveisFidelidade: [
    { nome: 'PRATA', pontosMinimos: 0, desconto: 5 },
    { nome: 'GOLD', pontosMinimos: 100, desconto: 10 },
    { nome: 'BLACK', pontosMinimos: 250, desconto: 15 },
    { nome: 'DIAMOND', pontosMinimos: 400, desconto: 20 },
  ],
} as const;

// Função para calcular o nível baseado nos pontos
export const calcularNivelFidelidade = (pontos: number): string => {
  const niveis = POINTS_CONFIG.niveisFidelidade;
  
  // Encontrar o nível mais alto que o cliente atingiu
  for (let i = niveis.length - 1; i >= 0; i--) {
    if (pontos >= niveis[i].pontosMinimos) {
      return niveis[i].nome;
    }
  }
  
  return 'PRATA'; // Fallback
};

// Função para calcular progresso para o próximo nível
export const calcularProgressoNivel = (pontos: number): {
  nivelAtual: string;
  proximoNivel: string;
  pontosParaProximo: number;
  progresso: number;
} => {
  const niveis = POINTS_CONFIG.niveisFidelidade;
  const nivelAtual = calcularNivelFidelidade(pontos);
  
  // Encontrar o próximo nível
  const nivelAtualIndex = niveis.findIndex(n => n.nome === nivelAtual);
  const proximoNivel = nivelAtualIndex < niveis.length - 1 
    ? niveis[nivelAtualIndex + 1].nome 
    : nivelAtual;
  
  // Calcular pontos para o próximo nível
  const proximoNivelConfig = niveis.find(n => n.nome === proximoNivel);
  const pontosParaProximo = proximoNivelConfig ? proximoNivelConfig.pontosMinimos - pontos : 0;
  
  // Calcular progresso (0-100)
  const nivelAtualConfig = niveis.find(n => n.nome === nivelAtual);
  const proximoNivelConfig2 = niveis.find(n => n.nome === proximoNivel);
  
  let progresso = 0;
  if (nivelAtualConfig && proximoNivelConfig2 && nivelAtual !== proximoNivel) {
    const pontosNivelAtual = nivelAtualConfig.pontosMinimos;
    const pontosProximoNivel = proximoNivelConfig2.pontosMinimos;
    const pontosNecessarios = pontosProximoNivel - pontosNivelAtual;
    const pontosConquistados = pontos - pontosNivelAtual;
    progresso = Math.min(100, Math.max(0, (pontosConquistados / pontosNecessarios) * 100));
  } else {
    progresso = 100; // Máximo nível atingido
  }
  
  return {
    nivelAtual,
    proximoNivel,
    pontosParaProximo: Math.max(0, pontosParaProximo),
    progresso
  };
};

// Configurações de recompensas
export const REWARDS_CONFIG = {
  tipos: [
    { id: 'corte_gratis', nome: 'Corte Grátis', pontos: 500, icon: '🎁' },
    { id: 'produto_vip', nome: 'Produto VIP', pontos: 300, icon: '💎' },
    { id: 'barba_perfeita', nome: 'Barba Perfeita', pontos: 200, icon: '✂️' },
    { id: 'desconto_10', nome: 'Desconto 10%', pontos: 150, icon: '💰' },
    { id: 'produto_gratis', nome: 'Produto Grátis', pontos: 400, icon: '🎯' },
  ],
} as const;

// Configurações de animação
export const ANIMATION_CONFIG = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  delays: {
    none: 0,
    short: 100,
    medium: 200,
    long: 500,
  },
} as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'E-mail inválido',
  },
  phone: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone inválido',
  },
  cpf: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: 'CPF inválido',
  },
  password: {
    minLength: 6,
    message: 'Senha deve ter pelo menos 6 caracteres',
  },
} as const;

// Configurações de notificações
export const NOTIFICATION_CONFIG = {
  durations: {
    short: 3000,
    normal: 5000,
    long: 8000,
  },
  types: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
} as const;

// Configurações de rotas
export const ROUTES = {
  home: '/',
  login: '/login',
  admin: '/admin',
  adminDashboard: '/admin-dashboard',
  adminGestaoClientes: '/admin-gestao-clientes',
  adminRelatorios: '/admin-relatorios',
  adminConfiguracoes: '/admin-configuracoes',
  adminAuditoria: '/admin-auditoria',
  adminResetSenha: '/admin-reset-senha',
  cadastroCliente: '/cadastro-cliente',
  barbearia: {
    public: '/:slug',
    login: '/:slug/login',
    dashboard: '/barbearia/:id/dashboard',
    clientes: '/barbearia/:id/clientes',
    novoCliente: '/barbearia/:id/clientes/novo',
    scanQRCode: '/barbearia/:id/scan-qrcode',
    detalhesCliente: '/barbearia/:id/detalhes-cliente/:clienteId',
  },
} as const;

// Configurações de API
export const API_CONFIG = {
  endpoints: {
    barbearias: '/barbearias',
    clientes: '/clientes',
    transacoes: '/transacoes_pontos',
    recompensas: '/recompensas',
    niveis: '/niveis_fidelidade',
  },
  timeouts: {
    short: 5000,
    normal: 10000,
    long: 30000,
  },
} as const;

// Configurações de localStorage
export const STORAGE_KEYS = {
  auth: 'fideliza_auth',
  user: 'fideliza_user',
  theme: 'fideliza_theme',
  language: 'fideliza_language',
  settings: 'fideliza_settings',
} as const;

// Configurações de tema
export const THEME_CONFIG = {
  colors: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fonts: {
    primary: 'Inter',
    fallback: 'sans-serif',
  },
} as const;

// Configurações de responsividade
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  debounceDelay: 300,
  throttleDelay: 100,
  maxRetries: 3,
  retryDelay: 1000,
} as const;