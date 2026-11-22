import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enCommon from './locales/en/common.json';
import enCustomers from './locales/en/customers.json';
import enMeasurements from './locales/en/measurements.json';
import enSidebar from './locales/en/sidebar.json';
import enUsers from './locales/en/users.json';
import enOrders from './locales/en/orders.json';
import enAdminUsers from './locales/en/adminUsers.json';
import enJobs from './locales/en/jobs.json';

import urCommon from './locales/ur/common.json';
import urCustomers from './locales/ur/customers.json';
import urMeasurements from './locales/ur/measurements.json';
import urSidebar from './locales/ur/sidebar.json';
import urUsers from './locales/ur/users.json';
import urOrders from './locales/ur/orders.json';
import urAdminUsers from './locales/ur/adminUsers.json';
import urJobs from './locales/ur/jobs.json';

const resources = {
  en: {
    common: enCommon,
    customers: enCustomers,
    measurements: enMeasurements,
    sidebar: enSidebar,
    users: enUsers,
    orders: enOrders,
    adminUsers: enAdminUsers,
    jobs: enJobs,
  },
  ur: {
    common: urCommon,
    customers: urCustomers,
    measurements: urMeasurements,
    sidebar: urSidebar,
    users: urUsers,
    orders: urOrders,
    adminUsers: urAdminUsers,
    jobs: urJobs,
  },
};

const LANGUAGE_KEY = 'appLanguage';

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // default
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  supportedLngs: ['en', 'ur'],
  defaultNS: 'common',
  ns: ['common', 'customers', 'measurements', 'sidebar', 'users', 'orders', 'adminUsers', 'jobs'],
});

export default i18n;
