import { defineCollection, z } from '@nuxt/content'

// const variantEnum = z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link'])
// const colorEnum = z.enum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'])
// const sizeEnum = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])

const baseSchema = {
  title: z.string().nonempty(),
  description: z.string().nonempty(),
}
// const linkSchema = z.object({
//   label: z.string().nonempty(),
//   to: z.string().nonempty(),
//   icon: z.string().optional(),
//   size: sizeEnum,
//   trailing: z.boolean().optional(),
//   target: z.string().optional(),
//   color: colorEnum,
//   variant: variantEnum,
// })

// const sectionSchema = z.object({
//   headline: z.string().optional(),
//   ...baseSchema,
// })
// const sectionWithLinksSchema = sectionSchema.extend({
//   links: z.array(linkSchema),
// })

export const collections = {
  landing: defineCollection({
    source: 'index.yml',
    type: 'data',
    schema: z.object({
      ...baseSchema,
    }),
  }),
}
