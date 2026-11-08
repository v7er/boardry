import { z } from "zod";

export const noteLinkSchema = z.object({
  type: z.string(),
  target: z.string(),
});

export const noteIconSchema = z.object({
  name: z.string().optional(),
  color: z.string().optional(),
});

export const noteFrontmatterSchema = z
  .object({
    title: z.string().optional(),
    layer: z.string().optional(),
    component: z.string().optional(),
    kind: z.string().optional(),
    type: z.string().optional(),
    summary: z.string().optional(),
    icon: noteIconSchema.optional(),
    tags: z.array(z.string()).optional(),
    links: z.array(noteLinkSchema).optional(),
    updated: z.string().optional(),
  })
  .passthrough();

export type NoteFrontmatter = z.infer<typeof noteFrontmatterSchema>;
