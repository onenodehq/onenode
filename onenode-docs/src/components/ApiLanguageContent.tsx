'use client'
import { ReactNode } from 'react';
import { useApiLanguage } from '../context/ApiLanguageContext';

interface ApiLanguageContentProps {
  children: ReactNode;
  language: 'curl' | 'python' | 'javascript';
}

export default function ApiLanguageContent({ children, language }: ApiLanguageContentProps) {
  const { language: selectedLanguage } = useApiLanguage();
  
  // Only display content if the selected language matches
  if (language !== selectedLanguage) {
    return null;
  }
  
  return <div data-api-language={language}>{children}</div>;
} 