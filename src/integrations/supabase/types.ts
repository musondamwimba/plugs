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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_payment_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string | null
          id: string
          is_winning_bid: boolean | null
          payment_deadline: string | null
          payment_status: string | null
          product_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string | null
          id?: string
          is_winning_bid?: boolean | null
          payment_deadline?: string | null
          payment_status?: string | null
          product_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string | null
          id?: string
          is_winning_bid?: boolean | null
          payment_deadline?: string | null
          payment_status?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      brochures: {
        Row: {
          brochure_type: string | null
          brochure_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          outlet_id: string
          title: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          brochure_type?: string | null
          brochure_url: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          outlet_id: string
          title: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          brochure_type?: string | null
          brochure_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          outlet_id?: string
          title?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brochures_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cash_payment_requested: boolean | null
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cash_payment_requested?: boolean | null
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cash_payment_requested?: boolean | null
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          account_number: string | null
          amount: number
          created_at: string | null
          fee: number
          id: string
          payment_method: string
          phone_number: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          created_at?: string | null
          fee: number
          id?: string
          payment_method: string
          phone_number?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          created_at?: string | null
          fee?: number
          id?: string
          payment_method?: string
          phone_number?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          product_id: string | null
          receiver_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          product_id?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          product_id?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          product_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          product_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          product_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      outlets: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          name: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          account_number: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          external_transaction_id: string | null
          failed_reason: string | null
          fee: number
          id: string
          metadata: Json | null
          payment_method: string
          payment_provider: string | null
          phone_number: string | null
          status: string | null
          transaction_type: string
          updated_at: string | null
          user_id: string
          verification_code: string | null
          verified_at: string | null
        }
        Insert: {
          account_number?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          external_transaction_id?: string | null
          failed_reason?: string | null
          fee?: number
          id?: string
          metadata?: Json | null
          payment_method: string
          payment_provider?: string | null
          phone_number?: string | null
          status?: string | null
          transaction_type: string
          updated_at?: string | null
          user_id: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Update: {
          account_number?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          external_transaction_id?: string | null
          failed_reason?: string | null
          fee?: number
          id?: string
          metadata?: Json | null
          payment_method?: string
          payment_provider?: string | null
          phone_number?: string | null
          status?: string | null
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      product_documents: {
        Row: {
          created_at: string | null
          document_type: string | null
          document_url: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          document_url: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          document_url?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bid_end_time: string | null
          cash_only: boolean | null
          condition: Database["public"]["Enums"]["product_condition"] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_bid: boolean | null
          is_retail_shop: boolean | null
          is_sold: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          mobile_location: boolean | null
          name: string
          outlet_id: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          starting_bid: number | null
          subscription_paid: boolean | null
          updated_at: string | null
          use_profile_picture: boolean | null
          vendor_id: string
        }
        Insert: {
          bid_end_time?: string | null
          cash_only?: boolean | null
          condition?: Database["public"]["Enums"]["product_condition"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_bid?: boolean | null
          is_retail_shop?: boolean | null
          is_sold?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          mobile_location?: boolean | null
          name: string
          outlet_id?: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          starting_bid?: number | null
          subscription_paid?: boolean | null
          updated_at?: string | null
          use_profile_picture?: boolean | null
          vendor_id: string
        }
        Update: {
          bid_end_time?: string | null
          cash_only?: boolean | null
          condition?: Database["public"]["Enums"]["product_condition"] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_bid?: boolean | null
          is_retail_shop?: boolean | null
          is_sold?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          mobile_location?: boolean | null
          name?: string
          outlet_id?: string | null
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          starting_bid?: number | null
          subscription_paid?: boolean | null
          updated_at?: string | null
          use_profile_picture?: boolean | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number | null
          created_at: string | null
          full_name: string
          id: string
          nrc_back_url: string | null
          nrc_front_url: string | null
          nrc_number: string | null
          phone_number: string | null
          profile_picture_url: string | null
          total_ratings: number | null
          trading_license_url: string | null
          updated_at: string | null
          vendor_rating: number | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          full_name: string
          id: string
          nrc_back_url?: string | null
          nrc_front_url?: string | null
          nrc_number?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          total_ratings?: number | null
          trading_license_url?: string | null
          updated_at?: string | null
          vendor_rating?: number | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          full_name?: string
          id?: string
          nrc_back_url?: string | null
          nrc_front_url?: string | null
          nrc_number?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          total_ratings?: number | null
          trading_license_url?: string | null
          updated_at?: string | null
          vendor_rating?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          is_paid: boolean | null
          last_payment_date: string | null
          outlet_id: string | null
          product_id: string
          status: string | null
          subscription_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          is_paid?: boolean | null
          last_payment_date?: string | null
          outlet_id?: string | null
          product_id: string
          status?: string | null
          subscription_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          is_paid?: boolean | null
          last_payment_date?: string | null
          outlet_id?: string | null
          product_id?: string
          status?: string | null
          subscription_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          accent_color: string
          background_color: string
          border_radius: string
          created_at: string | null
          foreground_color: string
          id: string
          logo_url: string | null
          primary_color: string
          updated_at: string | null
          updated_by: string | null
          wallpaper_url: string | null
        }
        Insert: {
          accent_color?: string
          background_color?: string
          border_radius?: string
          created_at?: string | null
          foreground_color?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          updated_at?: string | null
          updated_by?: string | null
          wallpaper_url?: string | null
        }
        Update: {
          accent_color?: string
          background_color?: string
          border_radius?: string
          created_at?: string | null
          foreground_color?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          updated_at?: string | null
          updated_by?: string | null
          wallpaper_url?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          admin_fee: number | null
          amount: number
          created_at: string | null
          description: string | null
          id: string
          invoice_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          admin_fee?: number | null
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          admin_fee?: number | null
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_moderation: {
        Row: {
          created_at: string | null
          expires_at: string | null
          fine_amount: number | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          reason: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          fine_amount?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          fine_amount?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_number: string | null
          amount: number
          created_at: string | null
          fee: number
          id: string
          payment_method: string | null
          phone_number: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          created_at?: string | null
          fee: number
          id?: string
          payment_method?: string | null
          phone_number?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          created_at?: string | null
          fee?: number
          id?: string
          payment_method?: string | null
          phone_number?: string | null
          status?: string | null
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
      app_role: "admin" | "vendor" | "buyer"
      product_condition: "new" | "like_new" | "good" | "fair" | "poor"
      product_type: "good" | "service"
      user_status: "active" | "suspended" | "banned" | "blocked"
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
      app_role: ["admin", "vendor", "buyer"],
      product_condition: ["new", "like_new", "good", "fair", "poor"],
      product_type: ["good", "service"],
      user_status: ["active", "suspended", "banned", "blocked"],
    },
  },
} as const
