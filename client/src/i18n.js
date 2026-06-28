import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation resources
import en from './locales/en.json';
import es from './locales/es.json';
import hi from './locales/hi.json';

// Determine initial language: try JWT claim stored in localStorage under 'eduquest_locale', fallback to browser language
const savedLocale = localStorage.getItem('eduquest_locale');
const browserLang = navigator.language.split('-')[0];
const fallbackLang = savedLocale || (['en', 'es', 'hi'].includes(browserLang) ? browserLang : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      hi: { translation: hi },
    },
    lng: fallbackLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
