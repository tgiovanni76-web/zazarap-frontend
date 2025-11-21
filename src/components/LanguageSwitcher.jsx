import React from 'react';
import { useLanguage } from './LanguageProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              language === lang.code 
                ? 'bg-red-600 text-white' 
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            title={lang.label}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-slate-600" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}