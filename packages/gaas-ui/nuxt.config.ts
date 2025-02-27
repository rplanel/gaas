// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui-pro',
    'nuxt-galaxy',
    '@nuxt/test-utils/module',
  ],
  // routeRules: {
  // '/': { prerender: true },
  // '/galaxy/**': { prerender: false },
  // },
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    typedPages: true,
  },
  css: ['../app/assets/css/main.css'],
})
