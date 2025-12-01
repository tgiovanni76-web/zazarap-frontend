import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { ChevronDown } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-lg p-1 rounded hover:bg-white/20 transition-all"
        aria-label="Seleziona lingua"
      >
        {flags[language]}
        <ChevronDown className={`h-3 w-3 text-[#f9d65c] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-50 py-1 min-w-[120px]">
            {languages.map(code => (
              <button 
                key={code}
                onClick={() => {
                  setLanguage(code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 transition-colors ${
                  language === code ? 'bg-slate-50 font-semibold' : ''
                }`}
              >
                <span className="text-lg">{flags[code]}</span>
                <span className="text-slate-700">{code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}