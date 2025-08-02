// Interfaces para o sistema de associações cliente-barbearia

export interface ClienteBarbeariaAssociacao {
  id: string;
  cliente_id: string;
  barbearia_id: string;
  barbearia_nome?: string;
  pontos_acumulados: number;
  nivel_fidelidade: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  data_associacao: string;
  ativo: boolean;
}

export interface AssociacaoComDetalhes {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_cpf: string;
  barbearia_id: string;
  barbearia_nome: string;
  pontos_acumulados: number;
  nivel_fidelidade: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  data_associacao: string;
  ativo: boolean;
}

export interface ClienteComAssociacoes {
  id: string;
  nome_completo: string;
  cpf_id: string;
  celular_whatsapp: string;
  qr_code_id: string;
  data_cadastro: string;
  associacoes: ClienteBarbeariaAssociacao[];
}

export interface NovaAssociacao {
  cliente_id: string;
  barbearia_id: string;
  pontos_acumulados?: number;
  nivel_fidelidade?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
} 