import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Repository {
  label: string;
  url: string;
}

interface Settings {
  repos: Repository[];
  logoUrl: string | null;
  institutionName: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  repos: [
    { label: 'Repositorio Oficial', url: 'https://drive.google.com/drive/folders/1bNXWPC4gtZFVUdSoOS-1QpiXumNsX5tZ' }
  ],
  logoUrl: null,
  institutionName: 'Escuela Secundaria N1 "Tratado de Alcaraz"',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('school_assistant_settings');
    if (!saved) return defaultSettings;
    try {
      const parsed = JSON.parse(saved);
      // Migration: Convert old single repoUrl to repos array
      if (!parsed.repos && parsed.repoUrl) {
        return {
          ...defaultSettings,
          ...parsed,
          repos: [{ label: 'Repositorio Oficial', url: parsed.repoUrl }]
        };
      }
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.error('Error parsing settings', e);
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('school_assistant_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
