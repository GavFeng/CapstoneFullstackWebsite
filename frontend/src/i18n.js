import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Load translation files from /public/locales
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,

    interpolation: {
      escapeValue: false, 
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    supportedLngs: ['en', 'ko', 'zh', 'zh-CN'],
    nonExplicitSupportedLngs: true,
    
    load: 'languageOnly' 
  });

export default i18n;