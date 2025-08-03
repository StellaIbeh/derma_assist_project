import Constants from 'expo-constants';

export interface EnvironmentConfig {
  geminiApiKey: string | undefined;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const extra = Constants.expoConfig?.extra;
  
  return {
    geminiApiKey: extra?.geminiApiKey || process.env.GEMINI_API_KEY,
  };
};

export const config = getEnvironmentConfig(); 