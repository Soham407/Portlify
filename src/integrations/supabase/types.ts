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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bio_sections: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          first_name: string
          headline: string
          id: string
          last_name: string
          location: string | null
          portfolio_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          first_name?: string
          headline?: string
          id?: string
          last_name?: string
          location?: string | null
          portfolio_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          first_name?: string
          headline?: string
          id?: string
          last_name?: string
          location?: string | null
          portfolio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bio_sections_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          credential_url: string | null
          description: string | null
          display_order: number | null
          expiry_date: string | null
          id: string
          image_url: string | null
          issue_date: string | null
          issuer: string
          name: string
          portfolio_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_url?: string | null
          description?: string | null
          display_order?: number | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          issuer?: string
          name: string
          portfolio_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          credential_url?: string | null
          description?: string | null
          display_order?: number | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          issuer?: string
          name?: string
          portfolio_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_info: {
        Row: {
          created_at: string
          email: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          phone: string | null
          portfolio_id: string
          social_urls: Json | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_id: string
          social_urls?: Json | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_id?: string
          social_urls?: Json | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_info_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_sections: {
        Row: {
          body: string
          created_at: string
          display_order: number
          id: string
          portfolio_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          display_order?: number
          id?: string
          portfolio_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          display_order?: number
          id?: string
          portfolio_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_sections_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          cgpa: string | null
          created_at: string
          degree: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          field_of_study: string | null
          graduation_year: string | null
          id: string
          institution: string
          portfolio_id: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          cgpa?: string | null
          created_at?: string
          degree?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          field_of_study?: string | null
          graduation_year?: string | null
          id?: string
          institution: string
          portfolio_id?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          cgpa?: string | null
          created_at?: string
          degree?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          field_of_study?: string | null
          graduation_year?: string | null
          id?: string
          institution?: string
          portfolio_id?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_feedback: {
        Row: {
          created_at: string
          id: string
          least_liked_feature: string
          liked_feature: string
          page_path: string
          persona: string
          signup_blocker: string
          user_id: string | null
          wanted_feature: string
        }
        Insert: {
          created_at?: string
          id?: string
          least_liked_feature: string
          liked_feature: string
          page_path?: string
          persona: string
          signup_blocker: string
          user_id?: string | null
          wanted_feature: string
        }
        Update: {
          created_at?: string
          id?: string
          least_liked_feature?: string
          liked_feature?: string
          page_path?: string
          persona?: string
          signup_blocker?: string
          user_id?: string | null
          wanted_feature?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          display_order: number | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          portfolio_id: string | null
          role_title: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          portfolio_id?: string | null
          role_title: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          portfolio_id?: string | null
          role_title?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          created_at: string
          display_order: number | null
          github_url: string | null
          id: string
          image_url: string | null
          name: string
          portfolio_id: string | null
          problem_statement: string | null
          problem_statement_old: string | null
          project_type: string | null
          project_url: string | null
          solution_approach: string | null
          tags: string[] | null
          technologies: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          name: string
          portfolio_id?: string | null
          problem_statement?: string | null
          problem_statement_old?: string | null
          project_type?: string | null
          project_url?: string | null
          solution_approach?: string | null
          tags?: string[] | null
          technologies?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          name?: string
          portfolio_id?: string | null
          problem_statement?: string | null
          problem_statement_old?: string | null
          project_type?: string | null
          project_url?: string | null
          solution_approach?: string | null
          tags?: string[] | null
          technologies?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_views: {
        Row: {
          id: string
          portfolio_id: string
          share_channel: string | null
          user_agent: string | null
          viewed_at: string
          viewer_ip: string | null
        }
        Insert: {
          id?: string
          portfolio_id: string
          share_channel?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewer_ip?: string | null
        }
        Update: {
          id?: string
          portfolio_id?: string
          share_channel?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_views_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          custom_domain: string | null
          domain_status: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          last_moderated_at: string | null
          moderation_status: string | null
          name: string | null
          not_applicable_sections: string[] | null
          portfolio_type: string | null
          hidden_sections: string[] | null
          share_token: string | null
          section_layouts: Json | null
          section_order: string[] | null
          template_id: string | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          domain_status?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          last_moderated_at?: string | null
          moderation_status?: string | null
          name?: string | null
          not_applicable_sections?: string[] | null
          portfolio_type?: string | null
          hidden_sections?: string[] | null
          share_token?: string | null
          section_layouts?: Json | null
          section_order?: string[] | null
          template_id?: string | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          domain_status?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          last_moderated_at?: string | null
          moderation_status?: string | null
          name?: string | null
          not_applicable_sections?: string[] | null
          portfolio_type?: string | null
          hidden_sections?: string[] | null
          share_token?: string | null
          section_layouts?: Json | null
          section_order?: string[] | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          career_type: string | null
          created_at: string
          email: string | null
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          is_public: boolean | null
          linkedin_url: string | null
          location: string | null
          onboarding_completed_at: string | null
          portfolio_goal: string | null
          preferred_template: string | null
          role: string | null
          selected_role: string | null
          selected_template: string | null
          skill_level: string | null
          starter_content_mode: string | null
          twitter_url: string | null
          updated_at: string
          user_type: string | null
          username: string | null
          website_url: string | null
          import_intent: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          career_type?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id: string
          is_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_completed_at?: string | null
          portfolio_goal?: string | null
          preferred_template?: string | null
          role?: string | null
          selected_role?: string | null
          selected_template?: string | null
          skill_level?: string | null
          starter_content_mode?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          website_url?: string | null
          import_intent?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          career_type?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          is_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_completed_at?: string | null
          portfolio_goal?: string | null
          preferred_template?: string | null
          role?: string | null
          selected_role?: string | null
          selected_template?: string | null
          skill_level?: string | null
          starter_content_mode?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          website_url?: string | null
          import_intent?: string | null
        }
        Relationships: []
      }
      section_order_config: {
        Row: {
          created_at: string | null
          default_order: string[]
          id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          default_order: string[]
          id?: string
          user_type: string
        }
        Update: {
          created_at?: string | null
          default_order?: string[]
          id?: string
          user_type?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          portfolio_id: string | null
          proficiency: number | null
          skill_category: string | null
          skill_name: string
          skill_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          portfolio_id?: string | null
          proficiency?: number | null
          skill_category?: string | null
          skill_name: string
          skill_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          portfolio_id?: string | null
          proficiency?: number | null
          skill_category?: string | null
          skill_name?: string
          skill_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_share_portfolio: {
        Args: { p_portfolio_id: string }
        Returns: boolean
      }
      get_portfolio_completion: {
        Args: { p_portfolio_id: string }
        Returns: number
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
