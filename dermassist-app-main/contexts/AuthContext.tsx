import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ 
    error: any; 
    needsConfirmation?: boolean; 
    message?: string; 
  }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMounted = useRef(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isMounted.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      if (session?.user) {
        fetchProfile(session.user.id);
      } else if (isMounted.current) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      
      if (session?.user) {
        await fetchProfile(session.user.id);
        
        // Navigate to main app after successful authentication
        if (event === 'SIGNED_IN' && isMounted.current) {
          console.log('User signed in, navigating to main app');
          router.replace('/(tabs)');
        }
      } else if (isMounted.current) {
        setProfile(null);
        setLoading(false);
        
        // Navigate to auth screen if user signs out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, navigating to auth');
          router.replace('/auth');
        }
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (error && error.code === 'PGRST116') {
        // No profile found, create one
        console.log('No profile found, creating default profile for user:', userId);
        await createDefaultProfile(userId);
      } else if (data && isMounted.current) {
        setProfile(data);
      } else if (isMounted.current) {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      const fullName = userData.user?.user_metadata?.full_name || 'User';

      // First, try to insert the profile (ignore if it already exists)
      await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          role: 'patient',
          full_name: fullName,
          membership_type: 'Free',
        })
        .onConflict('user_id')
        .ignore();

      // Then fetch the profile (whether it was just created or already existed)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error creating default profile:', error);
        // Set a temporary profile to prevent loading issues
        if (isMounted.current) {
          setProfile({
            id: 'temp',
            user_id: userId,
            role: 'patient',
            full_name: fullName,
            membership_type: 'Free',
            created_at: new Date().toISOString(),
            email: email,
          });
        }
      } else if (data && isMounted.current) {
        setProfile({ ...data, email });
      }
    } catch (error) {
      console.error('Error creating default profile:', error);
      // Set fallback profile
      if (isMounted.current) {
        setProfile({
          id: 'temp',
          user_id: userId,
          role: 'patient',
          full_name: 'User',
          membership_type: 'Free',
          created_at: new Date().toISOString(),
          email: '',
        });
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting to sign up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined,
        },
      });
  
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
  
      console.log('Signup successful, user data:', data.user);
  
      // Check if user needs to confirm email
      if (data.user && !data.session) {
        // User was created but not signed in (email confirmation required)
        console.log('Email confirmation required for user:', data.user.email);
        return { 
          error: null, 
          needsConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete your registration.'
        };
      }
  
      // User was signed in immediately (email confirmation disabled)
      console.log('User signed in immediately, no confirmation needed');
      return { error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful:', data.user?.email);
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
    await AsyncStorage.clear(); // Clear any cached data
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
        })
        .eq('user_id', user.id);

      if (!error) {
        await refreshProfile();
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user && isMounted.current) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}