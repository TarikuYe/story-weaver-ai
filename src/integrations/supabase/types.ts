export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chapters: {
        Row: {
          chapter_number: number
          content: string
          created_at: string
          id: string
          story_id: string
          title: string
          updated_at: string
          user_id: string
          word_count: number
        }
        Insert: {
          chapter_number: number
          content?: string
          created_at?: string
          id?: string
          story_id: string
          title: string
          updated_at?: string
          user_id: string
          word_count?: number
        }
        Update: {
          chapter_number?: number
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          id: string
          user_id: string
          story_id: string | null
          name: string
          age: string | null
          occupation: string | null
          appearance: string | null
          backstory: string | null
          strengths: string | null
          weaknesses: string | null
          skills: string | null
          goals: string | null
          relationships: string | null
          personality: string | null
          clothing: string | null
          voice_style: string | null
          portrait_url: string | null
          genre: string | null
          prompt: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id?: string | null
          name?: string
          age?: string | null
          occupation?: string | null
          appearance?: string | null
          backstory?: string | null
          strengths?: string | null
          weaknesses?: string | null
          skills?: string | null
          goals?: string | null
          relationships?: string | null
          personality?: string | null
          clothing?: string | null
          voice_style?: string | null
          portrait_url?: string | null
          genre?: string | null
          prompt: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string | null
          name?: string
          age?: string | null
          occupation?: string | null
          appearance?: string | null
          backstory?: string | null
          strengths?: string | null
          weaknesses?: string | null
          skills?: string | null
          goals?: string | null
          relationships?: string | null
          personality?: string | null
          clothing?: string | null
          voice_style?: string | null
          portrait_url?: string | null
          genre?: string | null
          prompt?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      worlds: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string | null
          prompt: string
          overview: string | null
          geography: string | null
          history: string | null
          politics: string | null
          religion: string | null
          magic_system: string | null
          technology: string | null
          economy: string | null
          climate: string | null
          population: string | null
          notable_locations: Json | null
          factions: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          type?: string | null
          prompt: string
          overview?: string | null
          geography?: string | null
          history?: string | null
          politics?: string | null
          religion?: string | null
          magic_system?: string | null
          technology?: string | null
          economy?: string | null
          climate?: string | null
          population?: string | null
          notable_locations?: Json | null
          factions?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string | null
          prompt?: string
          overview?: string | null
          geography?: string | null
          history?: string | null
          politics?: string | null
          religion?: string | null
          magic_system?: string | null
          technology?: string | null
          economy?: string | null
          climate?: string | null
          population?: string | null
          notable_locations?: Json | null
          factions?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dialogues: {
        Row: {
          id: string
          user_id: string
          story_id: string | null
          title: string
          characters_involved: string | null
          emotion: string | null
          setting: string | null
          content: string | null
          prompt: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id?: string | null
          title?: string
          characters_involved?: string | null
          emotion?: string | null
          setting?: string | null
          content?: string | null
          prompt: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string | null
          title?: string
          characters_involved?: string | null
          emotion?: string | null
          setting?: string | null
          content?: string | null
          prompt?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comic_projects: {
        Row: {
          id: string
          user_id: string
          story_id: string | null
          title: string
          art_style: string | null
          panel_count: number
          panels: Json | null
          prompt: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id?: string | null
          title?: string
          art_style?: string | null
          panel_count?: number
          panels?: Json | null
          prompt: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string | null
          title?: string
          art_style?: string | null
          panel_count?: number
          panels?: Json | null
          prompt?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          id: string
          user_id: string
          story_id: string | null
          subject: string
          style: string | null
          prompt: string
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id?: string | null
          subject?: string
          style?: string | null
          prompt: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string | null
          subject?: string
          style?: string | null
          prompt?: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      interactive_stories: {
        Row: {
          id: string
          user_id: string
          title: string
          genre: string | null
          prompt: string
          opening: string | null
          nodes: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          genre?: string | null
          prompt: string
          opening?: string | null
          nodes?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          genre?: string | null
          prompt?: string
          opening?: string | null
          nodes?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audiobooks: {
        Row: {
          id: string
          user_id: string
          story_id: string | null
          title: string
          narrator_style: string | null
          chapters_audio: Json | null
          prompt: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id?: string | null
          title?: string
          narrator_style?: string | null
          chapters_audio?: Json | null
          prompt: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string | null
          title?: string
          narrator_style?: string | null
          chapters_audio?: Json | null
          prompt?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits: number
          dark_mode: boolean
          display_name: string | null
          id: string
          language: string
          subscription: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          dark_mode?: boolean
          display_name?: string | null
          id: string
          language?: string
          subscription?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          dark_mode?: boolean
          display_name?: string | null
          id?: string
          language?: string
          subscription?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          characters: string | null
          cover_image_url: string | null
          created_at: string
          genre: string | null
          id: string
          language: string
          length: string
          outline: Json | null
          prompt: string
          status: string
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          characters?: string | null
          cover_image_url?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          language?: string
          length?: string
          outline?: Json | null
          prompt: string
          status?: string
          title?: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          characters?: string | null
          cover_image_url?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          language?: string
          length?: string
          outline?: Json | null
          prompt?: string
          status?: string
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
