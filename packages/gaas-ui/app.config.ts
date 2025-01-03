export default defineAppConfig({
  myLayer: {
    name: 'Hello from Nuxt layer',
  },
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    gaasUi?: {
      /** Project name */
      name?: string
    }
  }
}
