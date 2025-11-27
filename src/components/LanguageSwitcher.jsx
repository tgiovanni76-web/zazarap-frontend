import React from 'react';
import { useLanguage } from './LanguageProvider';

const languages = [
  { code: 'de', label: '🇩🇪 DE' },
  { code: 'it', label: '🇮🇹 IT' },
  { code: 'en', label: '🇬🇧 EN' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select 
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="bg-[#cc0000] text-[#ffcc00] border-2 border-[#ffcc00] px-2 py-1 rounded-md font-semibold cursor-pointer focus:outline-none"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}