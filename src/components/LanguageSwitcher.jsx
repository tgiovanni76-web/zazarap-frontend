import React from 'react';
import { useLanguage } from './LanguageProvider';

const flags = {
  de: '🇩🇪',
  it: '🇮🇹',
  en: '🇬🇧',
  fr: '🇫🇷',
  pl: '🇵🇱',
  tr: '🇹🇷',
  uk: '🇺🇦'
};

const languages = ['de', 'it', 'en', 'fr', 'pl', 'tr', 'uk'];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {languages.map(code => (
        <button 
          key={code}
          onClick={() => setLanguage(code)}
          className={`text-lg p-1 rounded transition-all ${
            language === code 
              ? 'bg-white/20 scale-125' 
              : 'opacity-70 hover:opacity-100 hover:scale-110'
          }`}
          aria-label={`Switch to ${code.toUpperCase()}`}
          aria-pressed={language === code}
        >
          {flags[code]}
        </button>
      ))}
    </div>
  );
}