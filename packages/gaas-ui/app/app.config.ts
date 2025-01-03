import type { NavigationMenuItem } from '#ui/types'

export default defineAppConfig({
  myLayer: {
    name: 'Hello from Nuxt layer',
  },
  toaster: {
    position: 'bottom-right' as const,
    expand: true,
    duration: 5000,
  },
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
})

export interface OrderedNavigationMenuItem extends NavigationMenuItem {
  order: number
}
declare module '@nuxt/schema' {
  interface AppConfigInput {
    myLayer?: {
      /** Project name */
      name?: string
    }
    toaster: {
      position: string
      expand: boolean
      duration: number
    }
    navigationMenuItems: OrderedNavigationMenuItem[]
  }
}
export {}
