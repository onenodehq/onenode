'use client'
import { ReactNode } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageContentProps {
  children: ReactNode;
  language: 'python' | 'typescript';
}

export default function LanguageContent({ children, language }: LanguageContentProps) {
  const { language: selectedLanguage } = useLanguage();
  
  // Only display content if the selected language matches
  if (language !== selectedLanguage) {
    return null;
  }
  
  return <div data-language={language}>{children}</div>;
} 