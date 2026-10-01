export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          icon?: string;
          created_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          department_slug: string;
          qualifications: string[];
          experience_years: number;
          consultation_schedule: Json;
          photo_url: string | null;
          active: boolean;
          biography: string | null;
          languages: string[];
          created_at: string;
          updated_at: string;
          slug?: string | null;
          expertise?: string[] | null;
          education?: Json;
          faqs?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Insert: {
          id: string;
          name: string;
          department_slug: string;
          qualifications?: string[];
          experience_years?: number;
          consultation_schedule?: Json;
          photo_url?: string | null;
          active?: boolean;
          biography?: string | null;
          languages?: string[];
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          expertise?: string[] | null;
          education?: Json;
          faqs?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          department_slug?: string;
          qualifications?: string[];
          experience_years?: number;
          consultation_schedule?: Json;
          photo_url?: string | null;
          active?: boolean;
          biography?: string | null;
          languages?: string[];
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          expertise?: string[] | null;
          education?: Json;
          faqs?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
        };
      };
      doctor_weekly_schedules: {
        Row: {
          id: string;
          doctor_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          slot_duration_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          doctor_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          slot_duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          day_of_week?: string;
          start_time?: string;
          end_time?: string;
          slot_duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      doctor_exceptions: {
        Row: {
          id: string;
          doctor_id: string;
          date: string;
          type: "full_day_unavailable" | "partial_unavailable" | "custom_hours";
          reason: string | null;
          start_time: string | null;
          end_time: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          doctor_id: string;
          date: string;
          type?: "full_day_unavailable" | "partial_unavailable" | "custom_hours";
          reason?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          date?: string;
          type?: "full_day_unavailable" | "partial_unavailable" | "custom_hours";
          reason?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          date_of_birth: string;
          gender: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          date_of_birth: string;
          gender?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          booking_reference: string;
          patient_id: string | null;
          doctor_id: string;
          department_slug: string;
          patient_name: string;
          patient_phone: string;
          patient_dob: string;
          preferred_date: string;
          preferred_time_slot: string | null;
          message: string | null;
          status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "No-show";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_reference?: string;
          patient_id?: string | null;
          doctor_id: string;
          department_slug: string;
          patient_name: string;
          patient_phone: string;
          patient_dob: string;
          preferred_date: string;
          preferred_time_slot?: string | null;
          message?: string | null;
          status?: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "No-show";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_reference?: string;
          patient_id?: string | null;
          doctor_id?: string;
          department_slug?: string;
          patient_name?: string;
          patient_phone?: string;
          patient_dob?: string;
          preferred_date?: string;
          preferred_time_slot?: string | null;
          message?: string | null;
          status?: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "No-show";
          created_at?: string;
          updated_at?: string;
        };
      };
      staff_accounts: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          role: "admin" | "staff";
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          full_name: string;
          role?: "admin" | "staff";
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          role?: "admin" | "staff";
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
      };
    };
    Functions: {
      get_doctor_available_slots: {
        Args: {
          p_doctor_id: string;
          p_target_date: string;
        };
        Returns: {
          success: boolean;
          slots: Array<{
            time: string;
            label: string;
            available: boolean;
          }>;
          reason?: string;
          error?: string;
        };
      };
      create_booking: {
        Args: {
          p_doctor_id: string;
          p_department_slug: string;
          p_patient_name: string;
          p_patient_phone: string;
          p_patient_dob: string;
          p_preferred_date: string;
          p_preferred_time_slot?: string;
          p_message?: string;
        };
        Returns: {
          success: boolean;
          booking?: any;
          error?: string;
        };
      };
      lookup_booking: {
        Args: {
          p_booking_reference?: string;
          p_patient_phone?: string;
          p_patient_dob?: string;
        };
        Returns: {
          success: boolean;
          bookings: any[];
          error?: string;
        };
      };
    };
  };
}
