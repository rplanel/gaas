// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    'nuxt-galaxy',
    '@nuxt/image',
    '@nuxt/ui-pro',
    '@nuxt/test-utils/module',
    '@nuxt/content',
  ],
  // routeRules: {
  //   '/': { prerender: true },
  // },
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    typedPages: true,
  },
  css: ['../app/assets/css/main.css'],
})
