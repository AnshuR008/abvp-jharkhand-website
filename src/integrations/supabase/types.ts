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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string | null
          created_at: string
          description: string | null
          district_id: string | null
          id: string
          image: string | null
          participants: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          activity_date?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          image?: string | null
          participants?: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          activity_date?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          image?: string | null
          participants?: number
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          link: string | null
          message: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          link?: string | null
          message: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          link?: string | null
          message?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          banner_image: string | null
          content: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          published: boolean
          slug: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          published?: boolean
          slug: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          published?: boolean
          slug?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_code: string
          certificate_type: string
          created_at: string
          district: string | null
          holder_name: string
          id: string
          issue_date: string
          issued_for: string | null
          updated_at: string
          valid: boolean
        }
        Insert: {
          certificate_code: string
          certificate_type?: string
          created_at?: string
          district?: string | null
          holder_name: string
          id?: string
          issue_date?: string
          issued_for?: string | null
          updated_at?: string
          valid?: boolean
        }
        Update: {
          certificate_code?: string
          certificate_type?: string
          created_at?: string
          district?: string | null
          holder_name?: string
          id?: string
          issue_date?: string
          issued_for?: string | null
          updated_at?: string
          valid?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          message: string
          mobile: string | null
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          message: string
          mobile?: string | null
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          message?: string
          mobile?: string | null
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          active: boolean
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          president_name: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          president_name?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          president_name?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          download_count: number
          file_type: string | null
          file_url: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_type?: string | null
          file_url: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number
          file_type?: string | null
          file_url?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          academic_year: string | null
          college: string | null
          consent: boolean
          course: string | null
          created_at: string
          district: string | null
          email: string | null
          event_id: string
          full_name: string
          id: string
          mobile: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          college?: string | null
          consent?: boolean
          course?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          event_id: string
          full_name: string
          id?: string
          mobile: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          college?: string | null
          consent?: boolean
          course?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          event_id?: string
          full_name?: string
          id?: string
          mobile?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_image: string | null
          city: string | null
          content: string | null
          created_at: string
          description: string | null
          district_id: string | null
          end_date: string | null
          id: string
          published: boolean
          registration_open: boolean
          slug: string
          start_date: string
          status: string
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          banner_image?: string | null
          city?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          end_date?: string | null
          id?: string
          published?: boolean
          registration_open?: boolean
          slug: string
          start_date?: string
          status?: string
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          banner_image?: string | null
          city?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          end_date?: string | null
          id?: string
          published?: boolean
          registration_open?: boolean
          slug?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_albums: {
        Row: {
          album_date: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          district_id: string | null
          id: string
          images: Json
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          album_date?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          images?: Json
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          album_date?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          id?: string
          images?: Json
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_albums_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          designation: string
          district_id: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          name: string
          phone: string | null
          photo: string | null
          published: boolean
          slug: string
          sort_order: number
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          category?: string
          created_at?: string
          designation: string
          district_id?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          phone?: string | null
          photo?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          designation?: string
          district_id?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          phone?: string | null
          photo?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaders_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          category: string
          content: string | null
          created_at: string
          district_id: string | null
          excerpt: string | null
          featured: boolean
          featured_image: string | null
          id: string
          published: boolean
          published_at: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string
          district_id?: string | null
          excerpt?: string | null
          featured?: boolean
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string
          district_id?: string | null
          excerpt?: string | null
          featured?: boolean
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "news_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          facebook_url: string | null
          favicon_url: string | null
          footer_text: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          maintenance_mode: boolean
          seo_description: string | null
          seo_title: string | null
          site_name: string
          tagline: string
          twitter_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          maintenance_mode?: boolean
          seo_description?: string | null
          seo_title?: string | null
          site_name?: string
          tagline?: string
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          maintenance_mode?: boolean
          seo_description?: string | null
          seo_title?: string | null
          site_name?: string
          tagline?: string
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          active: boolean
          college_name: string | null
          contact_phone: string | null
          created_at: string
          district_id: string | null
          id: string
          incharge_name: string | null
          member_count: number
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          college_name?: string | null
          contact_phone?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          incharge_name?: string | null
          member_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          college_name?: string | null
          contact_phone?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          incharge_name?: string | null
          member_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
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
      videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          published: boolean
          published_on: string | null
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          published_on?: string | null
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          published_on?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          academic_year: string | null
          address: string | null
          admin_notes: string | null
          assigned_district: string | null
          city: string | null
          college: string | null
          consent: boolean
          course: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          email: string | null
          full_name: string
          id: string
          interests: string[]
          message: string | null
          mobile: string
          photo_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          address?: string | null
          admin_notes?: string | null
          assigned_district?: string | null
          city?: string | null
          college?: string | null
          consent?: boolean
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          full_name: string
          id?: string
          interests?: string[]
          message?: string | null
          mobile: string
          photo_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          address?: string | null
          admin_notes?: string | null
          assigned_district?: string | null
          city?: string | null
          college?: string | null
          consent?: boolean
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          interests?: string[]
          message?: string | null
          mobile?: string
          photo_url?: string | null
          status?: string
          updated_at?: string
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
      is_admin: { Args: never; Returns: boolean }
      claim_first_super_admin: { Args: never; Returns: boolean }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          certificate_code: string
          certificate_type: string
          holder_name: string
          issue_date: string
          issued_for: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "member" | "super_admin"
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
      app_role: ["admin", "editor", "member", "super_admin"],
    },
  },
} as const
