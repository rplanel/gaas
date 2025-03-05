import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/test-utils/module',
    'nuxt-galaxy',

  ],
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    typedPages: true,
  },
  css: [join(currentDir, './app/assets/css/main.css')],
})
