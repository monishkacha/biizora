import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('gu') ? 'gu' : 'en';

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('biizora_language', lang);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-cream/70 border border-stone p-1 rounded-xl shadow-subtle ${className}`}
      aria-label="Language selector"
      role="group"
    >
      <Globe className="w-3.5 h-3.5 text-warm-gray ml-1.5 hidden sm:inline" />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
          currentLang === 'en'
            ? 'bg-green-bottle text-white shadow-xs font-bold'
            : 'text-charcoal/70 hover:text-charcoal hover:bg-white/60'
        }`}
        aria-pressed={currentLang === 'en'}
      >
        EN
      </button>
      <span className="text-stone text-xs font-light">|</span>
      <button
        type="button"
        onClick={() => setLanguage('gu')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
          currentLang === 'gu'
            ? 'bg-green-bottle text-white shadow-xs font-bold'
            : 'text-charcoal/70 hover:text-charcoal hover:bg-white/60'
        }`}
        aria-pressed={currentLang === 'gu'}
      >
        ગુજરાતી
      </button>
    </div>
  );
}
