import { z } from "zod"

export const insertPostSchema = z.object({
  content: z.string(),
  media_key: z.string().cuid2().optional(),
  tripcode: z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .optional(),
})
