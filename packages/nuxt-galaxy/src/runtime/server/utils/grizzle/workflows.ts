import { useRuntimeConfig } from '#imports'
import { eq } from 'drizzle-orm'
import { workflows } from '../../db/schema/galaxy/workflows'
import { useDrizzle } from '../drizzle'
import { takeUniqueOrThrow } from './helper'
import { getCurrentUser } from './user'

export async function getCurrentGalaxyWorkflow(): Promise<typeof workflows.$inferSelect | undefined> {
  const { public: { galaxy: { url } }, galaxy: { email } } = useRuntimeConfig()
  const currentUser = await getCurrentUser(url, email)
  if (currentUser) {
    const { user } = currentUser
    return useDrizzle().select().from(workflows).where(
      eq(workflows.userId, user.id),
    ).then(takeUniqueOrThrow)
  }
}

export async function getWorkflow(workflowId: number): Promise<typeof workflows.$inferSelect | undefined> {
  const { public: { galaxy: { url } }, galaxy: { email } } = useRuntimeConfig()
  try {
    const currentUser = await getCurrentUser(url, email)
    if (currentUser) {
      const { user } = currentUser
      const galaxyWorkflows = await useDrizzle()
        .select()
        .from(workflows)
        .where(
          eq(workflows.id, workflowId),
        )
        .then(takeUniqueOrThrow)
      return galaxyWorkflows.userId === user.id ? galaxyWorkflows : undefined
    }
  }
  catch {
    throw new Error('User not found')
  }
}
