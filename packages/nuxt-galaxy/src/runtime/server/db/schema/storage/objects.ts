import { relations } from 'drizzle-orm'
import { jsonb, pgSchema, text, uuid } from 'drizzle-orm/pg-core'
import { datasets } from '../galaxy/datasets'

const storageSchema = pgSchema('storage')

export const objects = storageSchema.table('objects', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  metadata: jsonb('metadata'),
})

export const objectsRelations = relations(objects, ({ many }) => {
  return {
    datasets: many(datasets),
  }
})
