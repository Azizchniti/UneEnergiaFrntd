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
      announcement_views: {
        Row: {
          announcement_id: string | null
          id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          announcement_id?: string | null
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          announcement_id?: string | null
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_views_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          is_highlighted: boolean | null
          is_published: boolean | null
          publish_date: string
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_highlighted?: boolean | null
          is_published?: boolean | null
          publish_date: string
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_highlighted?: boolean | null
          is_published?: boolean | null
          publish_date?: string
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string | null
          description: string
          id: string
          max_attempts: number | null
          required_courses: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          max_attempts?: number | null
          required_courses?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          max_attempts?: number | null
          required_courses?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          materials: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          materials?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          materials?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          commission_percentage: number
          commission_value: number
          id: string
          is_paid: boolean | null
          lead_id: string | null
          member_id: string | null
          payment_date: string | null
          sale_date: string
          sale_value: number
        }
        Insert: {
          commission_percentage: number
          commission_value: number
          id?: string
          is_paid?: boolean | null
          lead_id?: string | null
          member_id?: string | null
          payment_date?: string | null
          sale_date: string
          sale_value: number
        }
        Update: {
          commission_percentage?: number
          commission_value?: number
          id?: string
          is_paid?: boolean | null
          lead_id?: string | null
          member_id?: string | null
          payment_date?: string | null
          sale_date?: string
          sale_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          classes: string[] | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          image_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          classes?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          image_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          classes?: string[] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          image_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      educational_content: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          name: string
          notes: string | null
          phone: string | null
          sale_value: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          sale_value?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          sale_value?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          steps: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          steps?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          steps?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          cpf: string | null
          first_name: string
          grade: Database["public"]["Enums"]["member_grade"]
          id: string
          last_name: string
          last_updated: string | null
          phone: string | null
          profile_picture: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          total_commission: number | null
          total_contacts: number | null
          total_sales: number | null
          upline_id: string | null
        }
        Insert: {
          cpf?: string | null
          first_name: string
          grade?: Database["public"]["Enums"]["member_grade"]
          id: string
          last_name: string
          last_updated?: string | null
          phone?: string | null
          profile_picture?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          total_commission?: number | null
          total_contacts?: number | null
          total_sales?: number | null
          upline_id?: string | null
        }
        Update: {
          cpf?: string | null
          first_name?: string
          grade?: Database["public"]["Enums"]["member_grade"]
          id?: string
          last_name?: string
          last_updated?: string | null
          phone?: string | null
          profile_picture?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          total_commission?: number | null
          total_contacts?: number | null
          total_sales?: number | null
          upline_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_member_profile"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_upline_id_fkey"
            columns: ["upline_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          upline_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          upline_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          upline_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_upline_id_fkey"
            columns: ["upline_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_member_monthly_commissions: {
        Args: { member_id_input: string }
        Returns: {
          year: number
          month: number
          total_commission: number
        }[]
      }
      update_all_member_grades: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      announcement_type: "news" | "notice" | "announcement"
      content_type: "course" | "class" | "certification" | "path"
      lead_status:
        | "new"
        | "contacted"
        | "in-progress"
        | "negotiating"
        | "closed"
        | "lost"
      member_grade: "beginner" | "silver" | "gold" | "platinum" | "diamond"
      member_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "member"
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
      announcement_type: ["news", "notice", "announcement"],
      content_type: ["course", "class", "certification", "path"],
      lead_status: [
        "new",
        "contacted",
        "in-progress",
        "negotiating",
        "closed",
        "lost",
      ],
      member_grade: ["beginner", "silver", "gold", "platinum", "diamond"],
      member_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "member"],
    },
  },
} as const
