import { relations } from 'drizzle-orm'
import { serial } from 'drizzle-orm/pg-core'
import { type RoleType, RoleTypes } from '../../../../types/nuxt-galaxy'
import { galaxy } from '../galaxy'
import { rolePermissions } from './rolePermissions'
import { userRoles } from './userRoles'

export const roleTypeEnum = galaxy.enum('role_type', RoleTypes)
export const roles = galaxy.table('roles', {
  id: serial('id').primaryKey(),
  name: roleTypeEnum('name').$type<RoleType>().notNull(),
})

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}))
