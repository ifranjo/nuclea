export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      beta_access: {
        Row: {
          cohort: string
          enabled: boolean
          granted_at: string
          id: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          cohort?: string
          enabled?: boolean
          granted_at?: string
          id?: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          cohort?: string
          enabled?: boolean
          granted_at?: string
          id?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_audit_log: {
        Row: {
          created_at: string
          email: string | null
          event: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_invitations: {
        Row: {
          accepted_at: string | null
          cohort: string
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          status: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          cohort?: string
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          status?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          cohort?: string
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_rate_limits: {
        Row: {
          count: number
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      capsules: {
        Row: {
          closed_at: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          gift_claimed_at: string | null
          gift_expires_at: string | null
          gift_state: string
          id: string
          lifecycle_last_activity_at: string
          owner_id: string
          share_token: string | null
          status: Database["public"]["Enums"]["capsule_status"]
          storage_used_bytes: number
          title: string | null
          trust_contacts_notified_at: string | null
          type: Database["public"]["Enums"]["capsule_type"]
          updated_at: string
          video_downloaded_at: string | null
          video_gift_path: string | null
          video_purge_status: string | null
          video_purged_at: string | null
        }
        Insert: {
          closed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          gift_claimed_at?: string | null
          gift_expires_at?: string | null
          gift_state?: string
          id?: string
          lifecycle_last_activity_at?: string
          owner_id: string
          share_token?: string | null
          status?: Database["public"]["Enums"]["capsule_status"]
          storage_used_bytes?: number
          title?: string | null
          trust_contacts_notified_at?: string | null
          type: Database["public"]["Enums"]["capsule_type"]
          updated_at?: string
          video_downloaded_at?: string | null
          video_gift_path?: string | null
          video_purge_status?: string | null
          video_purged_at?: string | null
        }
        Update: {
          closed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          gift_claimed_at?: string | null
          gift_expires_at?: string | null
          gift_state?: string
          id?: string
          lifecycle_last_activity_at?: string
          owner_id?: string
          share_token?: string | null
          status?: Database["public"]["Enums"]["capsule_status"]
          storage_used_bytes?: number
          title?: string | null
          trust_contacts_notified_at?: string | null
          type?: Database["public"]["Enums"]["capsule_type"]
          updated_at?: string
          video_downloaded_at?: string | null
          video_gift_path?: string | null
          video_purge_status?: string | null
          video_purged_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capsules_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          accepted_at: string | null
          capsule_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["collaborator_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          capsule_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          capsule_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          capsule_id: string
          captured_at: string | null
          created_at: string
          created_by: string
          file_name: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          text_content: string | null
          title: string | null
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string
        }
        Insert: {
          capsule_id: string
          captured_at?: string | null
          created_at?: string
          created_by: string
          file_name?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          text_content?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Update: {
          capsule_id?: string
          captured_at?: string | null
          created_at?: string
          created_by?: string
          file_name?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          text_content?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contents_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      designated_persons: {
        Row: {
          capsule_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          relationship: string | null
          user_id: string
          whatsapp_opt_in_at: string | null
          whatsapp_opt_in_source: string | null
        }
        Insert: {
          capsule_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          relationship?: string | null
          user_id: string
          whatsapp_opt_in_at?: string | null
          whatsapp_opt_in_source?: string | null
        }
        Update: {
          capsule_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          relationship?: string | null
          user_id?: string
          whatsapp_opt_in_at?: string | null
          whatsapp_opt_in_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designated_persons_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designated_persons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_optins: {
        Row: {
          capsule_id: string
          channel: string
          contact_ref: string
          created_at: string
          id: string
          opted_in: boolean
          opted_in_at: string
          source: string | null
          updated_at: string
        }
        Insert: {
          capsule_id: string
          channel: string
          contact_ref: string
          created_at?: string
          id?: string
          opted_in?: boolean
          opted_in_at?: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          capsule_id?: string
          channel?: string
          contact_ref?: string
          created_at?: string
          id?: string
          opted_in?: boolean
          opted_in_at?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_optins_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          capsule_id: string
          channel: string
          created_at: string
          id: string
          payload: Json
          recipient: string
          status: string
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capsule_id: string
          channel: string
          created_at?: string
          id?: string
          payload?: Json
          recipient: string
          status?: string
          template: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capsule_id?: string
          channel?: string
          created_at?: string
          id?: string
          payload?: Json
          recipient?: string
          status?: string
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          consent_source: string | null
          consent_version: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          privacy_accepted_at: string | null
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          consent_source?: string | null
          consent_version?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          privacy_accepted_at?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          consent_source?: string | null
          consent_version?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          privacy_accepted_at?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      video_purge_jobs: {
        Row: {
          attempts: number
          capsule_id: string
          completed_at: string | null
          created_at: string
          id: string
          idempotency_key: string
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          status: string
          storage_bucket: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          capsule_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          status?: string
          storage_bucket?: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          capsule_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          status?: string
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_purge_jobs_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_purge_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_user_internal_id: { Args: never; Returns: string }
      is_capsule_collaborator: { Args: { cap_id: string }; Returns: boolean }
      is_capsule_owner: { Args: { cap_id: string }; Returns: boolean }
    }
    Enums: {
      capsule_status:
        | "draft"
        | "active"
        | "closed"
        | "downloaded"
        | "expired"
        | "archived"
      capsule_type:
        | "legacy"
        | "together"
        | "social"
        | "pet"
        | "life_chapter"
        | "origin"
      collaborator_role: "owner" | "editor" | "viewer"
      content_type: "photo" | "video" | "audio" | "text" | "drawing"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      capsule_status: [
        "draft",
        "active",
        "closed",
        "downloaded",
        "expired",
        "archived",
      ],
      capsule_type: [
        "legacy",
        "together",
        "social",
        "pet",
        "life_chapter",
        "origin",
      ],
      collaborator_role: ["owner", "editor", "viewer"],
      content_type: ["photo", "video", "audio", "text", "drawing"],
    },
  },
} as const

