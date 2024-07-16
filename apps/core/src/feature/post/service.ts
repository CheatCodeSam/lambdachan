import { z } from "zod"
import { insertPostSchema } from "./schema"
import { Post } from "../../schema/Post"
import { db } from "../../db"
import { Media } from "../../schema/Media"
import { eq } from "drizzle-orm"
import { generateTripCode } from "../auth"

interface insertPostService {
  threadid: string
  post: z.infer<typeof insertPostSchema>
  ip: string
}

export const insertPostIntoDb = async (insertPost: insertPostService) => {
  const tripcode =
    insertPost.post.tripcode &&
    generateTripCode(
      insertPost.post.tripcode.username,
      insertPost.post.tripcode.password
    )

  const post = await db.transaction(async (tx) => {
    const post = await tx
      .insert(Post)
      .values({
        ip: insertPost.ip,
        content: insertPost.post.content,
        threadId: insertPost.threadid,
        tripcode: tripcode,
      })
      .returning()

    if (insertPost.post.media_key) {
      const media = await tx.query.Media.findFirst({
        where: eq(Media.key, insertPost.post.media_key),
      })
      if (!media) tx.rollback()
      await tx
        .update(Media)
        .set({ postId: post[0].id })
        .where(eq(Media.key, insertPost.post.media_key))
    }

    return post[0]
  })

  return post
}
