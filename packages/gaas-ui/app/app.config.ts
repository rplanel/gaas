import type { NavigationMenuItem } from '@nuxt/ui'

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
    footerItems: [
      {
        label: 'Issues',
        to: 'https://github.com/rplanel/gaas/issues',
        target: '_blank',
      },
      {
        label: 'Releases',
        to: 'https://github.com/rplanel/gaas/releases',
        target: '_blank',
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
export interface OrderedNavigationMenuItem extends NavigationMenuItem {
  order: number
}
declare module '@nuxt/schema' {
  interface AppConfigInput {
    gaasUi?: {
      /** Project name */
      name?: string
      navigationMenuItems?: OrderedNavigationMenuItem[]
      footerItems?: NavigationMenuItem[]
    }
    toaster: {
      position: string
      expand: boolean
      duration: number
    }
  }
}
export {}
