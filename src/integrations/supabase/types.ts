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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          place_id: string | null
          public_id: string | null
          starts_at: string | null
          status: string
          target_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          place_id?: string | null
          public_id?: string | null
          starts_at?: string | null
          status?: string
          target_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          place_id?: string | null
          public_id?: string | null
          starts_at?: string | null
          status?: string
          target_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          name_fr: string
          parent_id: string | null
          public_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          name_fr: string
          parent_id?: string | null
          public_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          name_fr?: string
          parent_id?: string | null
          public_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string
          name_fr: string
          public_id: string | null
          slug: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en: string
          name_fr: string
          public_id?: string | null
          slug: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string
          name_fr?: string
          public_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency: string | null
          flag_emoji: string | null
          id: string
          is_active: boolean
          languages: string | null
          name_ar: string
          name_en: string
          name_fr: string
          phone_code: string | null
          public_id: string | null
          slug: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean
          languages?: string | null
          name_ar: string
          name_en: string
          name_fr: string
          phone_code?: string | null
          public_id?: string | null
          slug: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean
          languages?: string | null
          name_ar?: string
          name_en?: string
          name_fr?: string
          phone_code?: string | null
          public_id?: string | null
          slug?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          category: string | null
          category_id: string | null
          city: string | null
          city_id: string | null
          country: string | null
          country_id: string | null
          created_at: string
          created_by: string | null
          finished_at: string | null
          id: string
          query: string | null
          result_count: number | null
          source: string | null
          status: string
          total_duplicates: number
          total_found: number
          total_imported: number
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          city?: string | null
          city_id?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          query?: string | null
          result_count?: number | null
          source?: string | null
          status?: string
          total_duplicates?: number
          total_found?: number
          total_imported?: number
        }
        Update: {
          category?: string | null
          category_id?: string | null
          city?: string | null
          city_id?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          query?: string | null
          result_count?: number | null
          source?: string | null
          status?: string
          total_duplicates?: number
          total_found?: number
          total_imported?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      import_results: {
        Row: {
          address: string | null
          created_at: string
          duplicate_place_id: string | null
          id: string
          import_job_id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          normalized_data: Json | null
          phone: string | null
          raw_data: Json | null
          status: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          duplicate_place_id?: string | null
          id?: string
          import_job_id: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          normalized_data?: Json | null
          phone?: string | null
          raw_data?: Json | null
          status?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          duplicate_place_id?: string | null
          id?: string
          import_job_id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          normalized_data?: Json | null
          phone?: string | null
          raw_data?: Json | null
          status?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_results_duplicate_place_id_fkey"
            columns: ["duplicate_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_results_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
          place_id: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          place_id: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_hours_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_cover: boolean
          place_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_cover?: boolean
          place_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_cover?: boolean
          place_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_images_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_owners: {
        Row: {
          created_at: string
          id: string
          place_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_owners_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          category_id: string
          city_id: string
          country_id: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_featured: boolean
          is_open: boolean
          is_verified: boolean
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          price_level: number | null
          public_id: string | null
          rating_avg: number | null
          rating_count: number
          search_vector: unknown
          slug: string
          source: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["place_status"]
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          category_id: string
          city_id: string
          country_id: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_featured?: boolean
          is_open?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          price_level?: number | null
          public_id?: string | null
          rating_avg?: number | null
          rating_count?: number
          search_vector?: unknown
          slug: string
          source?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string
          city_id?: string
          country_id?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_featured?: boolean
          is_open?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          price_level?: number | null
          public_id?: string | null
          rating_avg?: number | null
          rating_count?: number
          search_vector?: unknown
          slug?: string
          source?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["place_status"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_name: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          image: string | null
          is_available: boolean
          name: string
          place_id: string
          price: number | null
          public_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_name?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_available?: boolean
          name: string
          place_id: string
          price?: number | null
          public_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_name?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_available?: boolean
          name?: string
          place_id?: string
          price?: number | null
          public_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          public_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          public_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          public_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          place_id: string
          public_id: string | null
          rating: number
          status: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          place_id: string
          public_id?: string | null
          rating: number
          status?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          place_id?: string
          public_id?: string | null
          rating?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          place_id: string
          plan: string
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          place_id: string
          plan: string
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          place_id?: string
          plan?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
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
      generate_unique_public_id: { Args: { _table: unknown }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      slugify: { Args: { v: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "owner" | "user"
      place_status:
        | "pending"
        | "active"
        | "suspended"
        | "rejected"
        | "draft"
        | "pending_review"
        | "published"
        | "archived"
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
      app_role: ["admin", "owner", "user"],
      place_status: [
        "pending",
        "active",
        "suspended",
        "rejected",
        "draft",
        "pending_review",
        "published",
        "archived",
      ],
    },
  },
} as const
