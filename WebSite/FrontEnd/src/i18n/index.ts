import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh/common.json';
import koCommon from './locales/ko/common.json';
import enRoutes from './locales/en/routes.json';
import zhRoutes from './locales/zh/routes.json';
import koRoutes from './locales/ko/routes.json';

export const supportedLanguages = ['en', 'zh', 'ko'] as const;
export type LanguageCode = (typeof supportedLanguages)[number];

const STORAGE_KEY = 'bridgeus-language';

const getInitialLanguage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (supportedLanguages.includes(stored as LanguageCode)) {
    return stored;
  }
  const browserLang = navigator.language.toLowerCase();
  const matched = supportedLanguages.find((code) => browserLang.startsWith(code));
  return matched ?? 'en';
};

const instance = i18n.createInstance();

instance.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, routes: enRoutes },
    zh: { common: zhCommon, routes: zhRoutes },
    ko: { common: koCommon, routes: koRoutes },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'routes'],
  interpolation: { escapeValue: false },
});

export const setLanguage = (language: LanguageCode) => {
  instance.changeLanguage(language);
  localStorage.setItem(STORAGE_KEY, language);
};

export default instance;

