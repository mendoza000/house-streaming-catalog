export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "11.2.2 (f884da7)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          mail: string | null
          max_clients: number | null
          paid: boolean | null
          password: string | null
          pay_day: number | null
          service: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          mail?: string | null
          max_clients?: number | null
          paid?: boolean | null
          password?: string | null
          pay_day?: number | null
          service?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          mail?: string | null
          max_clients?: number | null
          paid?: boolean | null
          password?: string | null
          pay_day?: number | null
          service?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_service_fkey"
            columns: ["service"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context: Json | null
          created_at: string
          current_state: string
          expire_at: string | null
          id: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          current_state?: string
          expire_at?: string | null
          id: string
          phone_number?: string
          updated_at?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          current_state?: string
          expire_at?: string | null
          id?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          account_id: number | null
          account_service: number | null
          amount: number | null
          created_at: string
          day: number | null
          id: number
          is_reseller_customer: boolean | null
          name: string | null
          paid: boolean | null
          phone: string | null
          reseller: number | null
          screen: number | null
        }
        Insert: {
          account_id?: number | null
          account_service?: number | null
          amount?: number | null
          created_at?: string
          day?: number | null
          id?: number
          is_reseller_customer?: boolean | null
          name?: string | null
          paid?: boolean | null
          phone?: string | null
          reseller?: number | null
          screen?: number | null
        }
        Update: {
          account_id?: number | null
          account_service?: number | null
          amount?: number | null
          created_at?: string
          day?: number | null
          id?: number
          is_reseller_customer?: boolean | null
          name?: string | null
          paid?: boolean | null
          phone?: string | null
          reseller?: number | null
          screen?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_account_service_fkey"
            columns: ["account_service"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_reseller_fkey"
            columns: ["reseller"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: number
          jid: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          jid?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          jid?: string | null
          name?: string | null
        }
        Relationships: []
      }
      methods: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      monthly_analytics: {
        Row: {
          created_at: string | null
          id: string
          month: number
          total_sales_count: number
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          total_sales_count?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          total_sales_count?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          cart_hash: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          currency: string | null
          id: number
          items: Json | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          tracking_token: string
        }
        Insert: {
          amount?: number | null
          cart_hash?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          currency?: string | null
          id?: number
          items?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          tracking_token?: string
        }
        Update: {
          amount?: number | null
          cart_hash?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          currency?: string | null
          id?: number
          items?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          tracking_token?: string
        }
        Relationships: []
      }
      resellers: {
        Row: {
          created_at: string
          id: number
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          account_id: number | null
          client_id: number | null
          created_at: string
          id: number
          reseller: number | null
          screen: number | null
        }
        Insert: {
          account_id?: number | null
          client_id?: number | null
          created_at?: string
          id?: number
          reseller?: number | null
          screen?: number | null
        }
        Update: {
          account_id?: number | null
          client_id?: number | null
          created_at?: string
          id?: number
          reseller?: number | null
          screen?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_reseller_fkey"
            columns: ["reseller"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          comercial_name: string | null
          created_at: string
          description: string | null
          hidden: boolean | null
          id: number
          img: string | null
          is_by_request: boolean
          name: string | null
          screen_price: number | null
        }
        Insert: {
          category?: string | null
          comercial_name?: string | null
          created_at?: string
          description?: string | null
          hidden?: boolean | null
          id?: number
          img?: string | null
          is_by_request?: boolean
          name?: string | null
          screen_price?: number | null
        }
        Update: {
          category?: string | null
          comercial_name?: string | null
          created_at?: string
          description?: string | null
          hidden?: boolean | null
          id?: number
          img?: string | null
          is_by_request?: boolean
          name?: string | null
          screen_price?: number | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          account_id: number | null
          cart_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          description: string
          id: string
          months: number | null
          order_id: number | null
          receipt_url: string
          resolved_action: string | null
          resolved_at: string | null
          screen_number: number
          service_id: number | null
          source: string
          status: string | null
          telegram_msg_id: number
          type: string | null
        }
        Insert: {
          account_id?: number | null
          cart_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          months?: number | null
          order_id?: number | null
          receipt_url?: string
          resolved_action?: string | null
          resolved_at?: string | null
          screen_number?: number
          service_id?: number | null
          source?: string
          status?: string | null
          telegram_msg_id?: number
          type?: string | null
        }
        Update: {
          account_id?: number | null
          cart_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          months?: number | null
          order_id?: number | null
          receipt_url?: string
          resolved_action?: string | null
          resolved_at?: string | null
          screen_number?: number
          service_id?: number | null
          source?: string
          status?: string | null
          telegram_msg_id?: number
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      service_stock: {
        Row: {
          service_id: number | null
          capacity: number | null
          available: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      fulfill_order: {
        Args: { p_order_id: number }
        Returns: Json
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

// Exported types for convenience
export type Service = Database["public"]["Tables"]["services"]["Row"]
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"]
export type TicketInsert = Database["public"]["Tables"]["tickets"]["Insert"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"]
