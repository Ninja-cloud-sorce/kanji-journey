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
      profiles: {
        Row: {
          created_at: string
          current_level: string
          daily_goal_minutes: number
          display_name: string | null
          exam_date: string | null
          id: string
          learning_path: string | null
          onboarding_completed: boolean
          readiness_score: number
          streak: number
          updated_at: string
          user_id: string
          xp: number
          avatar_url: string | null
          bio: string | null
        }
        Insert: {
          created_at?: string
          current_level?: string
          daily_goal_minutes?: number
          display_name?: string | null
          exam_date?: string | null
          id?: string
          learning_path?: string | null
          onboarding_completed?: boolean
          readiness_score?: number
          streak?: number
          updated_at?: string
          user_id: string
          xp?: number
          avatar_url?: string | null
          bio?: string | null
        }
        Update: {
          created_at?: string
          current_level?: string
          daily_goal_minutes?: number
          display_name?: string | null
          exam_date?: string | null
          id?: string
          learning_path?: string | null
          onboarding_completed?: boolean
          readiness_score?: number
          streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
          avatar_url?: string | null
          bio?: string | null
        }
        Relationships: []
      }
      lesson_catalog: {
        Row: {
          id: string
          level: string
          week_number: number
          lesson_number: number
          title: string
          skill_area: string
          topics: string[]
          created_at: string
        }
        Insert: {
          id?: string
          level: string
          week_number: number
          lesson_number?: number
          title: string
          skill_area: string
          topics?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          level?: string
          week_number?: number
          lesson_number?: number
          title?: string
          skill_area?: string
          topics?: string[]
          created_at?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          id: string
          user_id: string
          selected_level: string
          motivation: string | null
          hours_per_week: number | null
          prior_experience: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          selected_level?: string
          motivation?: string | null
          hours_per_week?: number | null
          prior_experience?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          selected_level?: string
          motivation?: string | null
          hours_per_week?: number | null
          prior_experience?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      level_overrides: {
        Row: {
          id: string
          user_id: string
          level: string
          confirmed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level: string
          confirmed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level?: string
          confirmed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          level: string
          week_number: number
          completed: boolean
          completed_at: string | null
          quiz_score: number | null
          time_spent_sec: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          level: string
          week_number: number
          completed?: boolean
          completed_at?: string | null
          quiz_score?: number | null
          time_spent_sec?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          level?: string
          week_number?: number
          completed?: boolean
          completed_at?: string | null
          quiz_score?: number | null
          time_spent_sec?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          question_id: string
          question_text: string
          correct_answer: string
          user_answer: string
          is_correct: boolean
          skill_area: string
          topic: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          question_id: string
          question_text: string
          correct_answer: string
          user_answer: string
          is_correct: boolean
          skill_area: string
          topic: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          question_id?: string
          question_text?: string
          correct_answer?: string
          user_answer?: string
          is_correct?: boolean
          skill_area?: string
          topic?: string
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      weak_topics: {
        Row: {
          id: string
          user_id: string
          topic: string
          skill_area: string
          mistakes_count: number
          last_seen_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          skill_area: string
          mistakes_count?: number
          last_seen_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          skill_area?: string
          mistakes_count?: number
          last_seen_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weak_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcards: {
        Row: {
          id: string
          user_id: string
          lesson_id: string | null
          front: string
          back: string
          ease_factor: number
          interval_days: number
          review_state: string
          next_review_date: string
          reviews_total: number
          reviews_correct: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id?: string | null
          front: string
          back: string
          ease_factor?: number
          interval_days?: number
          review_state?: string
          next_review_date?: string
          reviews_total?: number
          reviews_correct?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string | null
          front?: string
          back?: string
          ease_factor?: number
          interval_days?: number
          review_state?: string
          next_review_date?: string
          reviews_total?: number
          reviews_correct?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      practice_questions: {
        Row: {
          id: string
          lesson_id: string
          level: string
          topic: string
          section: string
          prompt: string
          display_text: string | null
          options: string[]
          correct_index: number
          explanation: string | null
          is_exam_ready: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          level: string
          topic: string
          section: string
          prompt: string
          display_text?: string | null
          options: string[]
          correct_index: number
          explanation?: string | null
          is_exam_ready?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          level?: string
          topic?: string
          section?: string
          prompt?: string
          display_text?: string | null
          options?: string[]
          correct_index?: number
          explanation?: string | null
          is_exam_ready?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          characters: string[] | null
          collection_id: string
          content: string | null
          created_at: string
          id: string
          lesson_catalog_id: string | null
          order_index: number
          sort_order: number | null
          subtitle: string | null
          title: string
        }
        Relationships: []
      }
    }
    Functions: {
      complete_lesson: {
        Args: {
          p_lesson_id: string
          p_quiz_answers: Json
          p_time_spent_sec?: number
        }
        Returns: Json
      }
      recalculate_readiness: {
        Args: {
          p_user_id: string
          p_level: string
        }
        Returns: number
      }
      review_flashcard: {
        Args: {
          p_card_id: string
          p_grade: number
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
