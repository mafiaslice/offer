export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          intent: "need" | "help" | "both" | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          intent?: "need" | "help" | "both" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          intent?: "need" | "help" | "both" | null;
          created_at?: string;
        };
        Relationships: [];
      };
      gigs: {
        Row: {
          id: string;
          slug: string;
          host_user_id: string;
          title: string;
          summary: string;
          kind: "volunteer" | "paid";
          category: "Events" | "Community" | "Hospitality" | "Projects";
          location_label: string | null;
          location_type: "in-person" | "remote" | null;
          starts_at: string | null;
          ends_at: string | null;
          cover_image_url: string | null;
          cover_tone: "sunset" | "mint" | "night";
          status: "draft" | "open" | "filled" | "completed" | "cancelled";
          instructions: string | null;
          incentive: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          host_user_id: string;
          title: string;
          summary?: string;
          kind: "volunteer" | "paid";
          category: "Events" | "Community" | "Hospitality" | "Projects";
          location_label?: string | null;
          location_type?: "in-person" | "remote" | null;
          starts_at?: string | null;
          ends_at?: string | null;
          cover_image_url?: string | null;
          cover_tone?: "sunset" | "mint" | "night";
          status?: "draft" | "open" | "filled" | "completed" | "cancelled";
          instructions?: string | null;
          incentive?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          host_user_id?: string;
          title?: string;
          summary?: string;
          kind?: "volunteer" | "paid";
          category?: "Events" | "Community" | "Hospitality" | "Projects";
          location_label?: string | null;
          location_type?: "in-person" | "remote" | null;
          starts_at?: string | null;
          ends_at?: string | null;
          cover_image_url?: string | null;
          cover_tone?: "sunset" | "mint" | "night";
          status?: "draft" | "open" | "filled" | "completed" | "cancelled";
          instructions?: string | null;
          incentive?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gigs_host_user_id_fkey";
            columns: ["host_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      gig_roles: {
        Row: {
          id: string;
          gig_id: string;
          title: string;
          description: string | null;
          capacity: number | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          gig_id: string;
          title: string;
          description?: string | null;
          capacity?: number | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          gig_id?: string;
          title?: string;
          description?: string | null;
          capacity?: number | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "gig_roles_gig_id_fkey";
            columns: ["gig_id"];
            isOneToOne: false;
            referencedRelation: "gigs";
            referencedColumns: ["id"];
          },
        ];
      };
      gig_slots: {
        Row: {
          id: string;
          gig_id: string;
          role_id: string | null;
          starts_at: string;
          ends_at: string | null;
          capacity: number | null;
        };
        Insert: {
          id?: string;
          gig_id: string;
          role_id?: string | null;
          starts_at: string;
          ends_at?: string | null;
          capacity?: number | null;
        };
        Update: {
          id?: string;
          gig_id?: string;
          role_id?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          capacity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "gig_slots_gig_id_fkey";
            columns: ["gig_id"];
            isOneToOne: false;
            referencedRelation: "gigs";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          id: string;
          applicant_user_id: string;
          gig_id: string;
          role_id: string | null;
          slot_id: string | null;
          status: "pending" | "accepted" | "declined" | "withdrawn";
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          applicant_user_id: string;
          gig_id: string;
          role_id?: string | null;
          slot_id?: string | null;
          status?: "pending" | "accepted" | "declined" | "withdrawn";
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          applicant_user_id?: string;
          gig_id?: string;
          role_id?: string | null;
          slot_id?: string | null;
          status?: "pending" | "accepted" | "declined" | "withdrawn";
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_gig_id_fkey";
            columns: ["gig_id"];
            isOneToOne: false;
            referencedRelation: "gigs";
            referencedColumns: ["id"];
          },
        ];
      };
      message_threads: {
        Row: {
          id: string;
          gig_id: string;
          host_user_id: string;
          participant_user_id: string;
          created_at: string;
          last_message_at: string;
          last_message_preview: string;
          last_message_sender_id: string | null;
          host_last_read_at: string | null;
          participant_last_read_at: string | null;
        };
        Insert: {
          id?: string;
          gig_id: string;
          host_user_id: string;
          participant_user_id: string;
          created_at?: string;
          last_message_at?: string;
          last_message_preview?: string;
          last_message_sender_id?: string | null;
          host_last_read_at?: string | null;
          participant_last_read_at?: string | null;
        };
        Update: {
          id?: string;
          gig_id?: string;
          host_user_id?: string;
          participant_user_id?: string;
          created_at?: string;
          last_message_at?: string;
          last_message_preview?: string;
          last_message_sender_id?: string | null;
          host_last_read_at?: string | null;
          participant_last_read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "message_threads_gig_id_fkey";
            columns: ["gig_id"];
            isOneToOne: false;
            referencedRelation: "gigs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "message_threads_host_user_id_fkey";
            columns: ["host_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "message_threads_participant_user_id_fkey";
            columns: ["participant_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "message_threads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey";
            columns: ["sender_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      check_ins: {
        Row: {
          id: string;
          gig_id: string;
          slot_id: string | null;
          user_id: string;
          checked_in_at: string;
          checked_out_at: string | null;
        };
        Insert: {
          id?: string;
          gig_id: string;
          slot_id?: string | null;
          user_id: string;
          checked_in_at?: string;
          checked_out_at?: string | null;
        };
        Update: {
          id?: string;
          gig_id?: string;
          slot_id?: string | null;
          user_id?: string;
          checked_in_at?: string;
          checked_out_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "check_ins_gig_id_fkey";
            columns: ["gig_id"];
            isOneToOne: false;
            referencedRelation: "gigs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
