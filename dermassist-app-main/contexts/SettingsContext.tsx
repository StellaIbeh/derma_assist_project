import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase, UserSettings } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSetting: (key: keyof Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: any) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const isMounted = useRef(true);
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isMounted.current = true;

    if (user) {
      fetchSettings();
    } else if (isMounted.current) {
      setSettings(null);
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      if (isMounted.current) {
        setLoading(true);
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error fetching settings:', error);
        // Create default settings on any error
        await createDefaultSettings();
      } else if (data && data.length > 0 && isMounted.current) {
        setSettings(data[0]);
      } else {
        // No settings found - create default settings
        console.log('No settings found, creating default settings for user:', user.id);
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Unexpected error fetching settings:', error);
      // Always create fallback settings on any error
      await createDefaultSettings();
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    try {
      console.log('Creating default settings for user:', user.id);
      const defaultSettings = {
        user_id: user.id,
        notifications: true,
        dark_mode: false,
        analytics_enabled: true,
        sound_enabled: true,
        haptics_enabled: true,
        auto_save: true,
        high_quality_images: true,
        language: 'English (US)',
        theme: 'system' as const,
      };

      // First, try to insert the settings (ignore if they already exist)
      await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .onConflict('user_id')
        .ignore();

      // Then fetch the settings (whether they were just created or already existed)
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        // Even if creation fails, set some default settings to prevent endless loading
        if (isMounted.current) {
          setSettings({
            id: 'temp',
            user_id: user.id,
            ...defaultSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } else if (data && isMounted.current) {
        console.log('Default settings created successfully:', data);
        setSettings(data);
      }
    } catch (error) {
      console.error('Error creating default settings:', error);
      // Set fallback settings to prevent endless loading
      if (isMounted.current) {
        setSettings({
          id: 'temp',
          user_id: user.id,
          notifications: true,
          dark_mode: false,
          analytics_enabled: true,
          sound_enabled: true,
          haptics_enabled: true,
          auto_save: true,
          high_quality_images: true,
          language: 'English (US)',
          theme: 'system' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  };

  const updateSetting = async (key: keyof Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: any) => {
    if (!user || !settings) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (!error && isMounted.current) {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
      } else {
        console.error('Error updating setting:', error);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSetting,
      refreshSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}