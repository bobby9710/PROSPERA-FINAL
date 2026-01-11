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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      automation_rules: {
        Row: {
          action_type: string
          action_value: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          trigger_type: string
          trigger_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          action_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          trigger_type: string
          trigger_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          action_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: string
          trigger_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_connections: {
        Row: {
          account_number: string | null
          bank_code: string
          bank_name: string
          created_at: string
          id: string
          last_sync_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          bank_code: string
          bank_name: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          bank_code?: string
          bank_name?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_default: boolean
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          current_progress: number
          description: string | null
          end_date: string
          id: string
          points_reward: number
          start_date: string
          status: string
          target_category_id: string | null
          target_goal_id: string | null
          target_value: number | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_progress?: number
          description?: string | null
          end_date: string
          id?: string
          points_reward?: number
          start_date?: string
          status?: string
          target_category_id?: string | null
          target_goal_id?: string | null
          target_value?: number | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_progress?: number
          description?: string | null
          end_date?: string
          id?: string
          points_reward?: number
          start_date?: string
          status?: string
          target_category_id?: string | null
          target_goal_id?: string | null
          target_value?: number | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_target_category_id_fkey"
            columns: ["target_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_target_goal_id_fkey"
            columns: ["target_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          brand: string
          closing_day: number
          color: string
          created_at: string
          credit_limit: number
          due_day: number
          id: string
          last_digits: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string
          closing_day: number
          color?: string
          created_at?: string
          credit_limit: number
          due_day: number
          id?: string
          last_digits: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          closing_day?: number
          color?: string
          created_at?: string
          credit_limit?: number
          due_day?: number
          id?: string
          last_digits?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      education_content: {
        Row: {
          category: string
          content: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_premium: boolean | null
          order_index: number | null
          quiz_data: Json | null
          thumbnail_url: string | null
          title: string
          type: string
          video_url: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          quiz_data?: Json | null
          thumbnail_url?: string | null
          title: string
          type: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          quiz_data?: Json | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          video_url?: string | null
        }
        Relationships: []
      }
      financial_insights: {
        Row: {
          content: Json
          created_at: string
          id: string
          period: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          period?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          period?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          created_at: string
          debts: number | null
          dependents: number | null
          emergency_fund: number | null
          fixed_expenses: number | null
          id: string
          investments: number | null
          monthly_income: number | null
          risk_profile: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          debts?: number | null
          dependents?: number | null
          emergency_fund?: number | null
          fixed_expenses?: number | null
          id?: string
          investments?: number | null
          monthly_income?: number | null
          risk_profile?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          debts?: number | null
          dependents?: number | null
          emergency_fund?: number | null
          fixed_expenses?: number | null
          id?: string
          investments?: number | null
          monthly_income?: number | null
          risk_profile?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          category: string | null
          created_at: string
          definition: string
          id: string
          related_terms: string[] | null
          term: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          definition: string
          id?: string
          related_terms?: string[] | null
          term: string
        }
        Update: {
          category?: string | null
          created_at?: string
          definition?: string
          id?: string
          related_terms?: string[] | null
          term?: string
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount: number
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          color: string
          created_at: string
          current_amount: number
          deadline: string | null
          icon: string
          id: string
          name: string
          priority: string
          status: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          current_amount?: number
          deadline?: string | null
          icon?: string
          id?: string
          name: string
          priority?: string
          status?: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          current_amount?: number
          deadline?: string | null
          icon?: string
          id?: string
          name?: string
          priority?: string
          status?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      imported_transactions: {
        Row: {
          amount: number
          bank_connection_id: string | null
          created_at: string
          date: string
          description: string
          external_id: string
          id: string
          match_score: number | null
          matched_transaction_id: string | null
          raw_data: Json | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_connection_id?: string | null
          created_at?: string
          date: string
          description: string
          external_id: string
          id?: string
          match_score?: number | null
          matched_transaction_id?: string | null
          raw_data?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_connection_id?: string | null
          created_at?: string
          date?: string
          description?: string
          external_id?: string
          id?: string
          match_score?: number | null
          matched_transaction_id?: string | null
          raw_data?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_transactions_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_transactions_matched_transaction_id_fkey"
            columns: ["matched_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string
          content_id: string
          id: string
          max_score: number
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          content_id: string
          id?: string
          max_score: number
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          content_id?: string
          id?: string
          max_score?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "education_content"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          date: string
          description: string
          id: string
          is_recurring: boolean
          notes: string | null
          payment_method: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          credit_card_id?: string | null
          date?: string
          description: string
          id?: string
          is_recurring?: boolean
          notes?: string | null
          payment_method?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          credit_card_id?: string | null
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean
          notes?: string | null
          payment_method?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_credit_card"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          created_at: string
          id: string
          level: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
