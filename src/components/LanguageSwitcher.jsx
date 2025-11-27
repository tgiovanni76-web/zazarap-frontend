import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

const languages = [
  { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/w20/de.png' },
  { code: 'it', name: 'Italiano', flag: 'https://flagcdn.com/w20/it.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'tr', name: 'Türkçe', flag: 'https://flagcdn.com/w20/tr.png' },
  { code: 'uk', name: 'Українська', flag: 'https://flagcdn.com/w20/ua.png' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={currentLang.flag} 
          alt={currentLang.code.toUpperCase()}
          className="w-[22px] h-[22px] rounded-full border-2 border-[#f9d65c]"
        />
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-8 right-0 z-50 bg-[#d62828] p-2.5 rounded-lg border-2 border-[#f9d65c] min-w-[140px]">
            {languages.map(lang => (
              <div 
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded hover:bg-[#b82020] text-[#f9d65c]"
              >
                <img src={lang.flag} alt={lang.name} className="w-5 h-5 rounded-sm" />
                <span className="text-sm">{lang.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}