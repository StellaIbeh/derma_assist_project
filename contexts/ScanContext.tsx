import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase, ScanRecord } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface ScanResult {
  id: string;
  date: Date;
  condition: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High';
  imageUri: string;
  bodyPart: string;
  description: string;
  careAdvice: string[];
  riskLevel: string;
  symptoms?: string[];
  treatmentOptions?: string[];
}

interface ScanContextType {
  scans: ScanResult[];
  loading: boolean;
  addScan: (scan: Omit<ScanResult, 'id' | 'date'>) => Promise<void>;
  getScanById: (id: string) => ScanResult | undefined;
  deleteScan: (id: string) => Promise<void>;
  refreshScans: () => Promise<void>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const isMounted = useRef(true);
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isMounted.current = true;

    if (user) {
      fetchScans();
    } else if (isMounted.current) {
      setScans([]);
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const fetchScans = async () => {
    if (!user) return;

    try {
      if (isMounted.current) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scans:', error);
      } else if (data && isMounted.current) {
        const formattedScans: ScanResult[] = data.map(scan => ({
          id: scan.id,
          date: new Date(scan.created_at),
          condition: scan.condition,
          confidence: scan.confidence,
          severity: scan.severity,
          imageUri: scan.image_url,
          bodyPart: scan.body_part,
          description: scan.description,
          careAdvice: scan.care_advice,
          riskLevel: scan.risk_level,
          symptoms: scan.symptoms,
          treatmentOptions: scan.treatment_options,
        }));
        setScans(formattedScans);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const addScan = async (scanData: Omit<ScanResult, 'id' | 'date'>) => {
    if (!user) return;

    try {
      // Upload image to Supabase Storage
      const imageFile = {
        uri: scanData.imageUri,
        type: 'image/jpeg',
        name: `scan-${Date.now()}.jpg`,
      };

      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      // For now, we'll store the local URI. In production, you'd upload to Supabase Storage
      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          condition: scanData.condition,
          confidence: scanData.confidence,
          severity: scanData.severity,
          image_url: scanData.imageUri, // In production, this would be the Supabase Storage URL
          body_part: scanData.bodyPart,
          description: scanData.description,
          care_advice: scanData.careAdvice,
          risk_level: scanData.riskLevel,
          symptoms: scanData.symptoms,
          treatment_options: scanData.treatmentOptions,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding scan:', error);
      } else if (data && isMounted.current) {
        const newScan: ScanResult = {
          id: data.id,
          date: new Date(data.created_at),
          condition: data.condition,
          confidence: data.confidence,
          severity: data.severity,
          imageUri: data.image_url,
          bodyPart: data.body_part,
          description: data.description,
          careAdvice: data.care_advice,
          riskLevel: data.risk_level,
          symptoms: data.symptoms,
          treatmentOptions: data.treatment_options,
        };
        setScans(prev => [newScan, ...prev]);
      }
    } catch (error) {
      console.error('Error adding scan:', error);
    }
  };

  const getScanById = (id: string) => {
    return scans.find(scan => scan.id === id);
  };

  const deleteScan = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting scan:', error);
      } else if (isMounted.current) {
        setScans(prev => prev.filter(scan => scan.id !== id));
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  const refreshScans = async () => {
    await fetchScans();
  };

  return (
    <ScanContext.Provider value={{
      scans,
      loading,
      addScan,
      getScanById,
      deleteScan,
      refreshScans,
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
}