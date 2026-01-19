import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh/common.json';
import enRoutes from './locales/en/routes.json';
import zhRoutes from './locales/zh/routes.json';

const STORAGE_KEY = 'bridgeus-language';

const getInitialLanguage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
};

const instance = i18n.createInstance();

instance.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, routes: enRoutes },
    zh: { common: zhCommon, routes: zhRoutes },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'routes'],
  interpolation: { escapeValue: false },
});

export const setLanguage = (language: 'en' | 'zh') => {
  instance.changeLanguage(language);
  localStorage.setItem(STORAGE_KEY, language);
};

export default instance;

