import 'dotenv/config'; // ✅ this loads .env before anything else
import { createClient } from '@supabase/supabase-js';

// ✅ Supabase configuration (supports both server + client env vars)
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing Supabase URL. Please set SUPABASE_URL (or VITE_SUPABASE_URL) in your environment.');
  console.error('Current values:', { SUPABASE_URL: process.env.SUPABASE_URL, VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL });
  throw new Error('Missing Supabase URL. Please set SUPABASE_URL');
}

if (!supabaseServiceKey) {
  console.warn('Supabase service role key not found. Falling back to anon key if available; some server-side operations may be restricted.');
  console.warn('To fix this, set SUPABASE_SERVICE_ROLE_KEY in your production environment (Vercel Environment Variables).');
}

// Create Supabase client with whichever key is available (service role preferred)
export const supabase = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const SUPABASE_USING_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

// Database types (generated from your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'staff';
          position?: string;
          department?: string;
          start_date?: string;
          phone?: string;
          avatar_url?: string;
          preferences: {
            language: 'nl' | 'en';
            notifications: boolean;
            theme: 'light' | 'dark';
          };
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: 'admin' | 'staff';
          position?: string;
          department?: string;
          start_date?: string;
          phone?: string;
          avatar_url?: string;
          preferences?: any;
          permissions?: string[];
        };
        Update: {
          name?: string;
          email?: string;
          role?: 'admin' | 'staff';
          position?: string;
          department?: string;
          start_date?: string;
          phone?: string;
          avatar_url?: string;
          preferences?: any;
          permissions?: string[];
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url?: string;
          author_id?: string;
          tags: string[];
          reactions: {
            heart: number;
            thumbsUp: number;
            flame: number;
            check: number;
          };
          user_reactions: Record<string, string>;
          is_important: boolean;
          read_by: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description: string;
          image_url?: string;
          author_id?: string;
          tags?: string[];
          reactions?: any;
          user_reactions?: any;
          is_important?: boolean;
          read_by?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          image_url?: string;
          tags?: string[];
          reactions?: any;
          user_reactions?: any;
          is_important?: boolean;
          read_by?: string[];
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          status: 'todo' | 'inprogress' | 'done';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assignee_id?: string;
          created_by_id?: string;
          due_date?: string;
          tags: string[];
          estimated_hours?: number;
          actual_hours?: number;
          created_at: string;
          updated_at: string;
          completed_at?: string;
        };
        Insert: {
          title: string;
          description?: string;
          status?: 'todo' | 'inprogress' | 'done';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assignee_id?: string;
          created_by_id?: string;
          due_date?: string;
          tags?: string[];
          estimated_hours?: number;
          actual_hours?: number;
        };
        Update: {
          title?: string;
          description?: string;
          status?: 'todo' | 'inprogress' | 'done';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assignee_id?: string;
          due_date?: string;
          tags?: string[];
          estimated_hours?: number;
          actual_hours?: number;
          completed_at?: string;
          updated_at?: string;
        };
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          completed: boolean;
          completed_at?: string;
          completed_by_id?: string;
          created_at: string;
        };
        Insert: {
          task_id: string;
          title: string;
          completed?: boolean;
          completed_at?: string;
          completed_by_id?: string;
        };
        Update: {
          title?: string;
          completed?: boolean;
          completed_at?: string;
          completed_by_id?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          start_time?: string;
          end_time?: string;
          type: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
          location?: string;
          notes?: string;
          created_by_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          employee_id: string;
          date: string;
          start_time?: string;
          end_time?: string;
          type: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
          location?: string;
          notes?: string;
          created_by_id?: string;
        };
        Update: {
          date?: string;
          start_time?: string;
          end_time?: string;
          type?: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
          location?: string;
          notes?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility functions
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    success: false,
    error: error.message || 'Database error occurred'
  };
};

export const createSupabaseResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message
  };
};
