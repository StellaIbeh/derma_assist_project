import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Log configuration for debugging
console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'dermassist-mobile-app',
    },
  },
});

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  location?: string;
  membership_type: 'Free' | 'Premium' | 'Pro';
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notifications: boolean;
  dark_mode: boolean;
  analytics_enabled: boolean;
  sound_enabled: boolean;
  haptics_enabled: boolean;
  auto_save: boolean;
  high_quality_images: boolean;
  language: string;
  theme: 'system' | 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

export interface ScanRecord {
  id: string;
  user_id: string;
  condition: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High';
  image_url: string;
  body_part: string;
  description: string;
  care_advice: string[];
  risk_level: string;
  symptoms?: string[];
  treatment_options?: string[];
  created_at: string;
}