import { and, eq } from 'drizzle-orm'
import { instances } from '../../db/schema/galaxy/instances'
import { users } from '../../db/schema/galaxy/users'
import { useDrizzle } from '../drizzle'
import { takeUniqueOrThrow } from './helper'

export async function getCurrentUser(url: string, email: string): Promise<{ user: typeof users.$inferSelect, instances: typeof instances.$inferSelect }> {
  return useDrizzle().select().from(users).innerJoin(instances, eq(users.instanceId, instances.id)).where(and(
    eq(users.email, email),
    eq(instances.url, url),
  )).then(takeUniqueOrThrow)
}
