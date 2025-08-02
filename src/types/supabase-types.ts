export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          usuario_auth_id: string
        }
        Insert: {
          usuario_auth_id: string
        }
        Update: {
          usuario_auth_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          usuario_id: string | null
          usuario_email: string | null
          acao: string
          tabela: string
          registro_id: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          ip_address: string | null
          user_agent: string | null
          nivel: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          usuario_email?: string | null
          acao: string
          tabela: string
          registro_id?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          nivel?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string | null
          usuario_email?: string | null
          acao?: string
          tabela?: string
          registro_id?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          nivel?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      barbearias: {
        Row: {
          created_at: string
          email_contato: string
          id: string
          nome_barbearia: string
          senha_hash: string
          slug: string | null
          updated_at: string
          usuario_auth_id: string | null
        }
        Insert: {
          created_at?: string
          email_contato: string
          id?: string
          nome_barbearia: string
          senha_hash: string
          slug?: string | null
          updated_at?: string
          usuario_auth_id?: string | null
        }
        Update: {
          created_at?: string
          email_contato?: string
          id?: string
          nome_barbearia?: string
          senha_hash?: string
          slug?: string | null
          updated_at?: string
          usuario_auth_id?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          barbearia_id: string
          celular_whatsapp: string
          cpf_id: string
          data_cadastro: string
          id: string
          nivel_fidelidade: string
          nome_completo: string
          pontos_acumulados: number
          qr_code_id: string
          total_gasto: number
          usuario_auth_id: string | null
        }
        Insert: {
          barbearia_id: string
          celular_whatsapp: string
          cpf_id: string
          data_cadastro?: string
          id?: string
          nivel_fidelidade?: string
          nome_completo: string
          pontos_acumulados?: number
          qr_code_id: string
          total_gasto?: number
          usuario_auth_id?: string | null
        }
        Update: {
          barbearia_id?: string
          celular_whatsapp?: string
          cpf_id?: string
          data_cadastro?: string
          id?: string
          nivel_fidelidade?: string
          nome_completo?: string
          pontos_acumulados?: number
          qr_code_id?: string
          total_gasto?: number
          usuario_auth_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
        ]
      }
      niveis_fidelidade: {
        Row: {
          barbearia_id: string | null
          id: string
          nome_nivel: string | null
          valor_pontos: number | null
        }
        Insert: {
          barbearia_id?: string | null
          id?: string
          nome_nivel?: string | null
          valor_pontos?: number | null
        }
        Update: {
          barbearia_id?: string | null
          id?: string
          nome_nivel?: string | null
          valor_pontos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "niveis_fidelidade_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
        ]
      }
      recompensas: {
        Row: {
          barbearia_id: string | null
          cliente_id: string | null
          data_resgate: string | null
          descricao: string | null
          id: string
          valor_pontos: number | null
        }
        Insert: {
          barbearia_id?: string | null
          cliente_id?: string | null
          data_resgate?: string | null
          descricao?: string | null
          id?: string
          valor_pontos?: number | null
        }
        Update: {
          barbearia_id?: string | null
          cliente_id?: string | null
          data_resgate?: string | null
          descricao?: string | null
          id?: string
          valor_pontos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recompensas_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recompensas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_pontos: {
        Row: {
          barbearia_id: string
          cliente_id: string
          data_transacao: string
          descricao: string | null
          id: string
          tipo: string
          valor_monetario_em_centavos: number | null
          valor_pontos: number
        }
        Insert: {
          barbearia_id: string
          cliente_id: string
          data_transacao?: string
          descricao: string
          id?: string
          tipo: string
          valor_monetario_associado?: number | null
          valor_pontos: number
        }
        Update: {
          barbearia_id?: string
          cliente_id?: string
          data_transacao?: string
          descricao?: string
          id?: string
          tipo?: string
          valor_monetario_associado?: number | null
          valor_pontos?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_pontos_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_pontos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_qr_code_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_barbearia_by_slug: {
        Args: { p_slug: string }
        Returns: {
          id: string
        }[]
      }
      insert_audit_log: {
        Args: {
          p_acao: string
          p_tabela: string
          p_registro_id?: string
          p_dados_anteriores?: Json
          p_dados_novos?: Json
          p_nivel?: string
          p_metadata?: Json
        }
        Returns: string
      }
      insert_security_alert: {
        Args: {
          p_tipo: string
          p_descricao: string
          p_ip_address?: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
