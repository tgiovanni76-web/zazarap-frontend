import React from 'react';
import { useLanguage } from './LanguageProvider';

const languages = ['de', 'it', 'en', 'fr', 'pl', 'tr', 'uk'];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {languages.map(code => (
        <button 
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            language === code 
              ? 'bg-[#f9d65c] text-[#d62828]' 
              : 'text-[#f9d65c] hover:bg-[#b82020]'
          }`}
          aria-label={`Switch to ${code.toUpperCase()}`}
          aria-pressed={language === code}
        >
          {code === 'uk' ? 'UA' : code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}