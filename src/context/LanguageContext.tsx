'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/locales/translations';

interface LanguageContextType {
  language: Language;
  isEn: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  isEn: false,
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  // Load language from localStorage or Cookie on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('petmm_language') as Language;
      if (savedLang === 'vi' || savedLang === 'en') {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
      }
    } catch {
      // Fallback
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('petmm_language', newLang);
      document.cookie = `petmm_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLang;
    } catch {
      // Ignore storage errors
    }
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key]['vi'] || defaultText || key;
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isEn: language === 'en', setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
