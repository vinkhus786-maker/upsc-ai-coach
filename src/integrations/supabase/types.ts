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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          is_correct: boolean | null
          kind: string
          pyq_id: string | null
          question_id: string | null
          score: number | null
          selected_option: number | null
          session_id: string | null
          time_taken_seconds: number | null
          topic_id: string
          user_answer: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          is_correct?: boolean | null
          kind?: string
          pyq_id?: string | null
          question_id?: string | null
          score?: number | null
          selected_option?: number | null
          session_id?: string | null
          time_taken_seconds?: number | null
          topic_id: string
          user_answer?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          is_correct?: boolean | null
          kind?: string
          pyq_id?: string | null
          question_id?: string | null
          score?: number | null
          selected_option?: number | null
          session_id?: string | null
          time_taken_seconds?: number | null
          topic_id?: string
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_pyq_id_fkey"
            columns: ["pyq_id"]
            isOneToOne: false
            referencedRelation: "pyqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_units: {
        Row: {
          common_misconception: string | null
          concept_tag: string | null
          content: string
          created_at: string
          id: string
          key_points: Json
          level: string
          sort_order: number
          summary: string | null
          title: string
          topic_id: string
        }
        Insert: {
          common_misconception?: string | null
          concept_tag?: string | null
          content: string
          created_at?: string
          id?: string
          key_points?: Json
          level?: string
          sort_order?: number
          summary?: string | null
          title: string
          topic_id: string
        }
        Update: {
          common_misconception?: string | null
          concept_tag?: string | null
          content?: string
          created_at?: string
          id?: string
          key_points?: Json
          level?: string
          sort_order?: number
          summary?: string | null
          title?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_units_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_scores: {
        Row: {
          attempts_count: number
          correct_count: number
          diagnostic_score: number | null
          id: string
          last_studied_at: string | null
          level: string
          mastery: number
          practice_score: number | null
          recall_score: number | null
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_count?: number
          correct_count?: number
          diagnostic_score?: number | null
          id?: string
          last_studied_at?: string | null
          level?: string
          mastery?: number
          practice_score?: number | null
          recall_score?: number | null
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts_count?: number
          correct_count?: number
          diagnostic_score?: number | null
          id?: string
          last_studied_at?: string | null
          level?: string
          mastery?: number
          practice_score?: number | null
          recall_score?: number | null
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_scores_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mistakes: {
        Row: {
          attempt_id: string | null
          concept_tag: string | null
          created_at: string
          description: string | null
          id: string
          mistake_type: string
          resolved: boolean
          topic_id: string
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          concept_tag?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mistake_type?: string
          resolved?: boolean
          topic_id: string
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          concept_tag?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mistake_type?: string
          resolved?: boolean
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mistakes_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mistakes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          source: string
          tags: Json
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          source?: string
          tags?: Json
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          source?: string
          tags?: Json
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          attempt_number: number | null
          created_at: string
          daily_hours: number | null
          full_name: string | null
          id: string
          onboarded: boolean
          optional_subject: string | null
          prep_stage: string | null
          target_year: number | null
          updated_at: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string
          daily_hours?: number | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          optional_subject?: string | null
          prep_stage?: string | null
          target_year?: number | null
          updated_at?: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string
          daily_hours?: number | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          optional_subject?: string | null
          prep_stage?: string | null
          target_year?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pyqs: {
        Row: {
          concept_tag: string | null
          correct_option: number
          created_at: string
          difficulty: string
          exam: string
          explanation: string | null
          id: string
          options: Json
          question_text: string
          topic_id: string
          year: number
        }
        Insert: {
          concept_tag?: string | null
          correct_option?: number
          created_at?: string
          difficulty?: string
          exam?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text: string
          topic_id: string
          year: number
        }
        Update: {
          concept_tag?: string | null
          correct_option?: number
          created_at?: string
          difficulty?: string
          exam?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
          topic_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pyqs_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          concept_tag: string | null
          correct_option: number | null
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          kind: string
          knowledge_unit_id: string | null
          level: string | null
          options: Json
          question_text: string
          sort_order: number
          topic_id: string
        }
        Insert: {
          concept_tag?: string | null
          correct_option?: number | null
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          kind?: string
          knowledge_unit_id?: string | null
          level?: string | null
          options?: Json
          question_text: string
          sort_order?: number
          topic_id: string
        }
        Update: {
          concept_tag?: string | null
          correct_option?: number | null
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          kind?: string
          knowledge_unit_id?: string | null
          level?: string | null
          options?: Json
          question_text?: string
          sort_order?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_knowledge_unit_id_fkey"
            columns: ["knowledge_unit_id"]
            isOneToOne: false
            referencedRelation: "knowledge_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          mistake_id: string | null
          priority: string
          status: string
          title: string
          topic_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          mistake_id?: string | null
          priority?: string
          status?: string
          title: string
          topic_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          mistake_id?: string | null
          priority?: string
          status?: string
          title?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_tasks_mistake_id_fkey"
            columns: ["mistake_id"]
            isOneToOne: false
            referencedRelation: "mistakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_tasks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          completed_at: string | null
          id: string
          kind: string
          level: string | null
          score: number | null
          stage: string
          started_at: string
          state: Json
          status: string
          topic_id: string
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          kind?: string
          level?: string | null
          score?: number | null
          stage?: string
          started_at?: string
          state?: Json
          status?: string
          topic_id: string
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          kind?: string
          level?: string | null
          score?: number | null
          stage?: string
          started_at?: string
          state?: Json
          status?: string
          topic_id?: string
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          syllabus_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          syllabus_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          syllabus_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_syllabus_id_fkey"
            columns: ["syllabus_id"]
            isOneToOne: false
            referencedRelation: "syllabus"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus: {
        Row: {
          code: string
          created_at: string
          description: string | null
          exam: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          exam?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          exam?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          subject_id: string
          weightage: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          subject_id: string
          weightage?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          subject_id?: string
          weightage?: number
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
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
