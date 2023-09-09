export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      game_flags: {
        Row: {
          id: number
          played_at: string
          score: number
          user_id: string
        }
        Insert: {
          id?: number
          played_at?: string
          score?: number
          user_id?: string
        }
        Update: {
          id?: number
          played_at?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_flags_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      game_pi: {
        Row: {
          id: number
          played_at: string
          score: number
          user_id: string
        }
        Insert: {
          id?: number
          played_at?: string
          score?: number
          user_id?: string
        }
        Update: {
          id?: number
          played_at?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_pi_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      game_stats: {
        Row: {
          data: Json | null
          game: string
        }
        Insert: {
          data?: Json | null
          game: string
        }
        Update: {
          data?: Json | null
          game?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          following: string[]
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string
          following?: string[]
          id: string
          updated_at?: string | null
          username?: string
        }
        Update: {
          avatar_url?: string
          following?: string[]
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_flags_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_pi_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_avatar: {
        Args: {
          avatar_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
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
