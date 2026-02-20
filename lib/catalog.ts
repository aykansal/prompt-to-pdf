import { z } from 'zod'

// Base style definitions
const StyleSchema = z.object({
  fontSize: z.number().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  marginTop: z.number().optional(),
  marginBottom: z.number().optional(),
  marginLeft: z.number().optional(),
  marginRight: z.number().optional(),
  padding: z.number().optional(),
})

export type Style = z.infer<typeof StyleSchema>

// Content element schemas
const HeadingSchema = z.object({
  type: z.literal('heading'),
  text: z.string(),
  level: z.enum(['h1', 'h2', 'h3', 'h4']).optional(),
  style: StyleSchema.optional(),
})

const ParagraphSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string(),
  style: StyleSchema.optional(),
})

const TableSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  style: StyleSchema.optional(),
})

const ListSchema = z.object({
  type: z.literal('list'),
  items: z.array(z.string()),
  ordered: z.boolean().optional(),
  style: StyleSchema.optional(),
})

const DividerSchema = z.object({
  type: z.literal('divider'),
  style: StyleSchema.optional(),
})

const ImageSchema = z.object({
  type: z.literal('image'),
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional(),
  style: StyleSchema.optional(),
})

const SectionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('section'),
    title: z.string().optional(),
    content: z.array(ContentElementSchema),
    style: StyleSchema.optional(),
  })
)

// Discriminated union of all content elements
export const ContentElementSchema = z.discriminatedUnion('type', [
  HeadingSchema,
  ParagraphSchema,
  TableSchema,
  ListSchema,
  DividerSchema,
  ImageSchema,
  SectionSchema,
])

export type ContentElement = z.infer<typeof ContentElementSchema>

// Page definition
export const PageSchema = z.object({
  title: z.string().optional(),
  content: z.array(ContentElementSchema),
  pageSize: z.enum(['A4', 'Letter']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  margin: z.number().optional(),
  style: StyleSchema.optional(),
})

export type Page = z.infer<typeof PageSchema>

// Document definition (can have multiple pages)
export const DocumentSchema = z.object({
  type: z.literal('document'),
  title: z.string(),
  pages: z.array(PageSchema).min(1),
})

export type Document = z.infer<typeof DocumentSchema>
