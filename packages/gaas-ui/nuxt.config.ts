// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-galaxy', '@nuxt/ui-pro'],
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    authTokenName: 'sb-eazhbrrdowqbzbbfjgxa-auth-token',
  },
  css: ['../app/assets/css/main.css'],

})
