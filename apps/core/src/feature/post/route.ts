import express from "express"
import { z } from "zod"
import {
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware"
import { db } from "../../db"
import { eq } from "drizzle-orm"
import { Thread } from "../../schema/Thread"
import { Post } from "../../schema/Post"
import { insertPostSchema } from "./schema"
import { Media } from "../../schema/Media"

export const postRouter = express.Router()

const postPathSchema = z.object({
  id: z.string().cuid2(),
})

postRouter.get(
  "/:id",
  validateRequestParams(postPathSchema),
  async (req, res) => {
    const { params } = req
    const post = await db.query.Post.findFirst({
      where: eq(Post.id, params.id),
      with: { media: true },
    })
    if (!post)
      return res.status(404).send({ message: `Post ${params.id} not found.` })
    return res.send(post)
  }
)

const postSchema = z.object({
  thread_id: z.string().cuid2(),
  post: insertPostSchema,
})

postRouter.post("", validateRequestBody(postSchema), async (req, res) => {
  const { body } = req
  const insertPost = body.post
  try {
    const retVal = await db.transaction(async (tx) => {
      const thread = await tx.query.Thread.findFirst({
        where: eq(Thread.id, body.thread_id),
      })
      if (!thread)
        return res
          .status(404)
          .json({ message: `Thread ${body.thread_id} not found.` })

      const post = await tx
        .insert(Post)
        .values({
          ip: req.ip ?? "null",
          content: insertPost.content,
          threadId: thread.id,
        })
        .returning()

      if (insertPost.media_key) {
        const media = await tx.query.Media.findFirst({
          where: eq(Media.key, insertPost.media_key),
        })
        if (!media) tx.rollback()
        await tx
          .update(Media)
          .set({ postId: post[0].id })
          .where(eq(Media.key, insertPost.media_key))
      }

      return res.json(post)
    })
    return retVal.send()
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Media ${insertPost.media_key} not found.` })
  }
})
