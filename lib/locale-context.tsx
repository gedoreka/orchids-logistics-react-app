"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';

import arMessages from '../messages/ar.json';
import enMessages from '../messages/en.json';

type Locale = 'ar' | 'en';
type Messages = typeof arMessages;

interface LocaleContextType {
  locale: Locale;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Force reload of translation files
const messagesMap: Record<Locale, Messages> = {
  ar: arMessages,
  en: enMessages,
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = Cookies.get('NEXT_LOCALE') as Locale;
    if (savedLocale && (savedLocale === 'ar' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 365, path: '/' });
    setLocaleState(newLocale);
  };

  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messagesMap[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    let result = typeof value === 'string' ? value : key;

    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
    }

    return result;
  }, [locale]);

  const isRTL = locale === 'ar';
  const messages = messagesMap[locale];

  return (
    <LocaleContext.Provider value={{ locale, isRTL, setLocale, t, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { t, locale, isRTL, messages } = useLocale();
  
  const translate = useCallback((key: string, values?: Record<string, string | number>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, values);
  }, [namespace, t]);

  return translate;
}
