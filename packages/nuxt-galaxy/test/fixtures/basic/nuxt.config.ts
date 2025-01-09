import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  galaxy: {
    apiKey: 'galaxy-api-key',
    email: 'email@example.com',
    url: 'https://galaxy.example.com',
  },
  supabase: { url: 'http://localhost:54323', key: 'anno-key' },
})
