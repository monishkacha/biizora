import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import guCommon from './locales/gu/common.json';

const resources = {
  en: {
    translation: enCommon,
  },
  gu: {
    translation: guCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'gu'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'biizora_language',
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
