import { relations } from 'drizzle-orm'
import { serial, varchar } from 'drizzle-orm/pg-core'
import { galaxy } from '../galaxy'
import { analysisOutputsToTags } from './analysisOutputs'
import { datasetsToTags } from './datasets'
import { workflowsToTags } from './workflows'

/**
 * Tags
 */
export const tags = galaxy.table('tags', {
  id: serial('id').primaryKey(),
  label: varchar('label', { length: 75 }).notNull().unique(),
})

export const tagsRelations = relations(tags, ({ many }) => {
  return {
    workflows: many(workflowsToTags),
    datasets: many(datasetsToTags),
    analysisOutputs: many(analysisOutputsToTags),
  }
})
