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
      admin_permissions: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          module: string
          permission_type: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          module: string
          permission_type: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          module?: string
          permission_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          role: Database["public"]["Enums"]["admin_role"]
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          role: Database["public"]["Enums"]["admin_role"]
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["admin_role"]
          username?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          poster_image_url: string | null
          title: string
          updated_at: string | null
          youtube_video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          poster_image_url?: string | null
          title: string
          updated_at?: string | null
          youtube_video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          poster_image_url?: string | null
          title?: string
          updated_at?: string | null
          youtube_video_url?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          created_at: string | null
          id: number
          operation: string | null
          query: string | null
          table_name: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          operation?: string | null
          query?: string | null
          table_name?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          operation?: string | null
          query?: string | null
          table_name?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      cash_summary: {
        Row: {
          cash_at_bank: number
          cash_in_hand: number
          id: string
          updated_at: string
        }
        Insert: {
          cash_at_bank?: number
          cash_in_hand?: number
          id?: string
          updated_at?: string
        }
        Update: {
          cash_at_bank?: number
          cash_in_hand?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          from_date: string | null
          id: string
          remarks: string | null
          to_date: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          from_date?: string | null
          id?: string
          remarks?: string | null
          to_date?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          from_date?: string | null
          id?: string
          remarks?: string | null
          to_date?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          actual_fee: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_highlighted: boolean | null
          name: string
          offer_fee: number
          popup_image_url: string | null
          preference: string | null
          qr_image_url: string | null
          updated_at: string | null
          warning_message: string | null
        }
        Insert: {
          actual_fee?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          name: string
          offer_fee?: number
          popup_image_url?: string | null
          preference?: string | null
          qr_image_url?: string | null
          updated_at?: string | null
          warning_message?: string | null
        }
        Update: {
          actual_fee?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          name?: string
          offer_fee?: number
          popup_image_url?: string | null
          preference?: string | null
          qr_image_url?: string | null
          updated_at?: string | null
          warning_message?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          payment_method: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          payment_method?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      panchayaths: {
        Row: {
          created_at: string | null
          district: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          address: string
          agent_pro: string | null
          approved_by: string | null
          approved_date: string | null
          category_id: string
          created_at: string | null
          customer_id: string
          fee_paid: number | null
          id: string
          mobile_number: string
          name: string
          panchayath_id: string | null
          preference: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          ward: string
        }
        Insert: {
          address: string
          agent_pro?: string | null
          approved_by?: string | null
          approved_date?: string | null
          category_id: string
          created_at?: string | null
          customer_id: string
          fee_paid?: number | null
          id?: string
          mobile_number: string
          name: string
          panchayath_id?: string | null
          preference?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          ward: string
        }
        Update: {
          address?: string
          agent_pro?: string | null
          approved_by?: string | null
          approved_date?: string | null
          category_id?: string
          created_at?: string | null
          customer_id?: string
          fee_paid?: number | null
          id?: string
          mobile_number?: string
          name?: string
          panchayath_id?: string | null
          preference?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          ward?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_panchayath_id_fkey"
            columns: ["panchayath_id"]
            isOneToOne: false
            referencedRelation: "panchayaths"
            referencedColumns: ["id"]
          },
        ]
      }
      utilities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_admins: {
        Args: { user_role: string }
        Returns: boolean
      }
      get_admin_permissions: {
        Args: { admin_id: string }
        Returns: {
          module: string
          permissions: string[]
        }[]
      }
      get_current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_context: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_admin_context: {
        Args: { admin_role: string }
        Returns: undefined
      }
    }
    Enums: {
      admin_role: "super_admin" | "local_admin" | "user_admin"
      application_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "manager" | "viewer"
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
    Enums: {
      admin_role: ["super_admin", "local_admin", "user_admin"],
      application_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "manager", "viewer"],
    },
  },
} as const
