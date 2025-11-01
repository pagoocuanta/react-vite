import { createClient } from '@supabase/supabase-js';

// Supabase configuration for client-side (public keys only)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback configuration for development
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Environment variables not found, using fallback configuration');
  supabaseUrl = 'https://dxjwqjeywxsnrxkoruhj.supabase.co';
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4andxamV5d3hzbnJ4a29ydWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTI4NDksImV4cCI6MjA3MDA4ODg0OX0.0T5NHinUe_QlTeA3VjO1PCk4T5r5sU1yypPoKEclH5k';
}

console.log('Supabase Config Debug:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
  hasAnonKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  usingFallback: !import.meta.env.VITE_SUPABASE_URL
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration even after fallback');
  throw new Error('Supabase configuration is required');
}

// Create Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'gruppy-app'
    }
  }
});

// Database types (matching server-side types)
export interface User {
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
}

export interface AuthUser {
  id: string;
  email: string;
  aud: string;
  role?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: Record<string, any>;
  identities?: any[];
  created_at: string;
  updated_at: string;
}
