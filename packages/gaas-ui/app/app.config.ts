export default defineAppConfig({
  gaasUi: {
    name: 'Hello from Nuxt layer',
    navigationMenuItems: [
      {
        label: 'Datasets',
        icon: 'i-lucide-files',
        to: '/datasets',
        order: 1,
      },
      {
        label: 'Workflows',
        icon: 'i-lucide:workflow',
        to: '/workflows',
        order: 2,
      },
      {
        label: 'Analyses',
        icon: 'i-streamline:code-analysis',
        to: '/analyses',
        order: 3,
      },
    ],
  },
  toaster: {
    position: 'bottom-right' as const,
    expand: true,
    duration: 5000,
  },

})

// should use extends NavigationMenuItem from @nuxt/ui but it is not working right now
export interface OrderedNavigationMenuItem {
  order: number
  label: string
  icon: string
  to: string
}
declare module '@nuxt/schema' {
  interface AppConfigInput {
    gaasUi?: {
      /** Project name */
      name?: string
      navigationMenuItems?: OrderedNavigationMenuItem[]
    }
    toaster: {
      position: string
      expand: boolean
      duration: number
    }
  }
}
export {}
