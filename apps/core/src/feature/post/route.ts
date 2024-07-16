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
import { insertPostIntoDb } from "./service"

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

  const thread = await db.query.Thread.findFirst({
    where: eq(Thread.id, body.thread_id),
  })

  if (!thread)
    return res
      .status(404)
      .json({ message: `Thread ${body.thread_id} not found.` })

  try {
    const post = await insertPostIntoDb({
      threadid: thread.id,
      ip: req.ip ?? "null",
      post: insertPost,
    })

    return res.json(post).send()
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Media ${insertPost.media_key} not found.` })
  }
})
