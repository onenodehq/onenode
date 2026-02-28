'use client'
import { createContext, useState, useContext, ReactNode } from 'react';

type ApiLanguage = 'curl' | 'python' | 'javascript';

interface ApiLanguageContextType {
  language: ApiLanguage;
  setLanguage: (lang: ApiLanguage) => void;
}

const ApiLanguageContext = createContext<ApiLanguageContextType | undefined>(undefined);

interface ApiLanguageProviderProps {
  children: ReactNode;
}

export function ApiLanguageProvider({ children }: ApiLanguageProviderProps) {
  const [language, setLanguage] = useState<ApiLanguage>('curl'); // Default language

  return (
    <ApiLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </ApiLanguageContext.Provider>
  );
}

export function useApiLanguage() {
  const context = useContext(ApiLanguageContext);
  if (!context) {
    throw new Error('useApiLanguage must be used within an ApiLanguageProvider');
  }
  return context;
} 