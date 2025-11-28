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
      <button 
        className="flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f9d65c] rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select language, current is ${currentLang.name}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <img 
          src={currentLang.flag} 
          alt={currentLang.name}
          className="w-[22px] h-[22px] rounded-full border-2 border-[#f9d65c]"
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="absolute top-8 right-0 z-50 bg-[#d62828] p-2.5 rounded-lg border-2 border-[#f9d65c] min-w-[140px]"
            role="menu"
            aria-orientation="vertical"
          >
            {languages.map(lang => (
              <button 
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded hover:bg-[#b82020] text-[#f9d65c] w-full text-left focus:outline-none focus:bg-[#b82020]"
                role="menuitem"
              >
                <img src={lang.flag} alt="" className="w-5 h-5 rounded-sm" />
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}