import { relations } from 'drizzle-orm'
import { integer, serial, unique, varchar } from 'drizzle-orm/pg-core'
import { galaxy } from '../galaxy'
import { histories } from './histories'
import { instances } from './instances'
import { userRoles } from './userRoles'
import { workflows } from './workflows'

/**
 * Users
 */

export const users = galaxy.table('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 100 }).notNull(),
  instanceId: integer('instance_id').notNull().references(() => instances.id, { onDelete: 'cascade' }),
}, t => ({
  unique: unique().on(t.email, t.instanceId),
}))

export const usersRelations = relations(users, ({ one, many }) => {
  return {
    instance: one(instances, {
      fields: [users.instanceId],
      references: [instances.id],
    }),
    userRoles: many(userRoles),
    workflows: many(workflows),
    histories: many(histories),
  }
})
