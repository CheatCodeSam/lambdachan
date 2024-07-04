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
    })
    if (!post)
      return res.status(404).send({ message: `Post ${params.id} not found.` })
    return res.send(post)
  }
)

const postSchema = z.object({
  thread_id: z.string().cuid2(),
  content: z.string(),
})

postRouter.post("", validateRequestBody(postSchema), async (req, res) => {
  const { body } = req
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
        content: body.content,
        threadId: thread.id,
      })
      .returning()

    return res.json(post)
  })
  return retVal.send()
})
