import type {} from 'nuxt/app'
import type { RouteLocationNormalized } from 'vue-router'
import { defineNuxtRouteMiddleware, navigateTo, useSupabaseUser } from '#imports'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const user = useSupabaseUser()
  if (!user.value)
    return navigateTo(`/login?redirectTo=${to.path}`)
})
