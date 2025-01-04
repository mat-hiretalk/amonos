export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      casino: {
        Row: {
          company_id: string | null
          id: string
          location: string
          name: string
        }
        Insert: {
          company_id?: string | null
          id?: string
          location: string
          name: string
        }
        Update: {
          company_id?: string | null
          id?: string
          location?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      gamesettings: {
        Row: {
          average_rounds_per_hour: number
          created_at: string | null
          house_edge: number
          id: string
          name: string
          point_multiplier: number | null
          points_conversion_rate: number | null
          seats_available: number
          updated_at: string | null
          version: number
        }
        Insert: {
          average_rounds_per_hour: number
          created_at?: string | null
          house_edge: number
          id?: string
          name: string
          point_multiplier?: number | null
          points_conversion_rate?: number | null
          seats_available?: number
          updated_at?: string | null
          version: number
        }
        Update: {
          average_rounds_per_hour?: number
          created_at?: string | null
          house_edge?: number
          id?: string
          name?: string
          point_multiplier?: number | null
          points_conversion_rate?: number | null
          seats_available?: number
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      gamingtable: {
        Row: {
          casino_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          table_number: string
          type: string
          updated_at: string | null
        }
        Insert: {
          casino_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          table_number: string
          type: string
          updated_at?: string | null
        }
        Update: {
          casino_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          table_number?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamingtable_casino_id_fkey"
            columns: ["casino_id"]
            isOneToOne: false
            referencedRelation: "casino"
            referencedColumns: ["id"]
          },
        ]
      }
      gamingtablesettings: {
        Row: {
          active_from: string | null
          game_settings_id: string | null
          gaming_table_id: string | null
          id: string
        }
        Insert: {
          active_from?: string | null
          game_settings_id?: string | null
          gaming_table_id?: string | null
          id?: string
        }
        Update: {
          active_from?: string | null
          game_settings_id?: string | null
          gaming_table_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamingtablesettings_game_settings_id_fkey"
            columns: ["game_settings_id"]
            isOneToOne: false
            referencedRelation: "activetablesandsettings"
            referencedColumns: ["game_settings_id"]
          },
          {
            foreignKeyName: "gamingtablesettings_game_settings_id_fkey"
            columns: ["game_settings_id"]
            isOneToOne: false
            referencedRelation: "gamesettings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamingtablesettings_gaming_table_id_fkey"
            columns: ["gaming_table_id"]
            isOneToOne: false
            referencedRelation: "activetablesandsettings"
            referencedColumns: ["gaming_table_id"]
          },
          {
            foreignKeyName: "gamingtablesettings_gaming_table_id_fkey"
            columns: ["gaming_table_id"]
            isOneToOne: false
            referencedRelation: "gamingtable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamingtablesettings_gaming_table_id_fkey"
            columns: ["gaming_table_id"]
            isOneToOne: false
            referencedRelation: "open_seats_by_table"
            referencedColumns: ["gaming_table_id"]
          },
        ]
      }
      language: {
        Row: {
          group_name: string | null
          id: string
          name: string
        }
        Insert: {
          group_name?: string | null
          id?: string
          name: string
        }
        Update: {
          group_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      player: {
        Row: {
          company_id: string | null
          dob: string | null
          email: string
          id: string
          name: string
          phone_number: string | null
          points: number
        }
        Insert: {
          company_id?: string | null
          dob?: string | null
          email: string
          id?: string
          name: string
          phone_number?: string | null
          points?: number
        }
        Update: {
          company_id?: string | null
          dob?: string | null
          email?: string
          id?: string
          name?: string
          phone_number?: string | null
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      playercasino: {
        Row: {
          casino_id: string
          player_id: string
        }
        Insert: {
          casino_id: string
          player_id: string
        }
        Update: {
          casino_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playercasino_casino_id_fkey"
            columns: ["casino_id"]
            isOneToOne: false
            referencedRelation: "casino"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playercasino_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      playerlanguage: {
        Row: {
          language_id: string
          player_id: string
        }
        Insert: {
          language_id: string
          player_id: string
        }
        Update: {
          language_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playerlanguage_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playerlanguage_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          description: string | null
          new_balance: number
          player_id: string
          points_delta: number
          transaction_id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          new_balance: number
          player_id: string
          points_delta: number
          transaction_id?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          new_balance?: number
          player_id?: string
          points_delta?: number
          transaction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_player_id"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      ratingslip: {
        Row: {
          average_bet: number
          cash_in: number | null
          chips_brought: number | null
          chips_taken: number | null
          end_time: string | null
          game_settings: Json
          gaming_table_id: string | null
          id: string
          points_earned: number
          seat_number: number | null
          start_time: string
          visit_id: string | null
        }
        Insert: {
          average_bet: number
          cash_in?: number | null
          chips_brought?: number | null
          chips_taken?: number | null
          end_time?: string | null
          game_settings: Json
          gaming_table_id?: string | null
          id?: string
          points_earned?: number
          seat_number?: number | null
          start_time: string
          visit_id?: string | null
        }
        Update: {
          average_bet?: number
          cash_in?: number | null
          chips_brought?: number | null
          chips_taken?: number | null
          end_time?: string | null
          game_settings?: Json
          gaming_table_id?: string | null
          id?: string
          points_earned?: number
          seat_number?: number | null
          start_time?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratingslip_gaming_table_id_fkey"
            columns: ["gaming_table_id"]
            isOneToOne: false
            referencedRelation: "activetablesandsettings"
            referencedColumns: ["gaming_table_id"]
          },
          {
            foreignKeyName: "ratingslip_gaming_table_id_fkey"
            columns: ["gaming_table_id"]
            isOneToOne: false
            referencedRelation: "gamingtable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratingslip_gaming_table_id_fkey"
            columns: ["gaming_table_id"]
            isOneToOne: false
            referencedRelation: "open_seats_by_table"
            referencedColumns: ["gaming_table_id"]
          },
          {
            foreignKeyName: "ratingslip_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visit"
            referencedColumns: ["id"]
          },
        ]
      }
      visit: {
        Row: {
          casino_id: string | null
          check_in_date: string
          check_out_date: string | null
          id: string
          player_id: string | null
        }
        Insert: {
          casino_id?: string | null
          check_in_date: string
          check_out_date?: string | null
          id?: string
          player_id?: string | null
        }
        Update: {
          casino_id?: string | null
          check_in_date?: string
          check_out_date?: string | null
          id?: string
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_casino_id_fkey"
            columns: ["casino_id"]
            isOneToOne: false
            referencedRelation: "casino"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      activetablesandsettings: {
        Row: {
          active_from: string | null
          average_rounds_per_hour: number | null
          casino_id: string | null
          game_settings_id: string | null
          gaming_table_id: string | null
          house_edge: number | null
          point_multiplier: number | null
          points_conversion_rate: number | null
          seats_available: number | null
          settings_name: string | null
          table_description: string | null
          table_name: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gamingtable_casino_id_fkey"
            columns: ["casino_id"]
            isOneToOne: false
            referencedRelation: "casino"
            referencedColumns: ["id"]
          },
        ]
      }
      open_seats_by_table: {
        Row: {
          casino_id: string | null
          gaming_table_id: string | null
          open_seat_numbers: string | null
          table_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamingtable_casino_id_fkey"
            columns: ["casino_id"]
            isOneToOne: false
            referencedRelation: "casino"
            referencedColumns: ["id"]
          },
        ]
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
