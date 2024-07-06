import { z } from "zod"

export const insertPostSchema = z.object({
  content: z.string(),
  media_key: z.string().cuid2().optional(),
})
