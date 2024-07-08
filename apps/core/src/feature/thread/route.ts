import express from "express"
import { z } from "zod"
import {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
} from "zod-express-middleware"
import { db } from "../../db"
import { Thread } from "../../schema/Thread"
import { and, count, desc, eq, exists } from "drizzle-orm"
import { Board } from "../../schema/Board"
import { Post } from "../../schema/Post"
import { Media } from "../../schema/Media"

export const threadRouter = express.Router()

const threadSchema = z.object({
  board_id: z.string(),
  title: z.string(),
  post: z.object({
    content: z.string(),
  }),
})

threadRouter.post("", validateRequestBody(threadSchema), async (req, res) => {
  const { body } = req

  const board = await db.query.Board.findFirst({
    where: eq(Board.id, body.board_id),
  })
  if (!board)
    return res
      .status(404)
      .send({ message: `Board ${body.board_id} not found.` })

  const x = await db.transaction(async (tx) => {
    const board = await tx.query.Board.findFirst({
      where: eq(Board.id, body.board_id),
    })
    if (!board)
      return res
        .status(404)
        .json({ message: `Board ${body.board_id} not found.` })

    const thread = await tx
      .insert(Thread)
      .values({ boardId: body.board_id, title: body.title })
      .returning()
    const post = await tx
      .insert(Post)
      .values({
        threadId: thread[0].id,
        content: body.post.content,
        ip: req.ip ?? "null",
      })
      .returning()
    return res.json({ thread, post })
  })

  return x.send()
})

const getThreadSchema = z.object({
  id: z.string().cuid2(),
})

threadRouter.get(
  "/:id",
  validateRequestParams(getThreadSchema),
  async (req, res) => {
    const { params } = req
    const result = await db.query.Thread.findFirst({
      where: eq(Thread.id, params.id),
    })
    if (!result)
      return res.status(404).send({ message: `${params.id} not found.` })
    const replys = await db.select({ count: count() }).from(Post).where(eq(Post.threadId, result.id))
    console.log(replys)
    return res.send(result)
  }
)

const getThreadPostSchema = z.object({
  id: z.string().cuid2(),
})

const getThreadPostQuerySchema = z.object({
  start: z.number().int().optional(),
  limit: z.number().int().optional(),
})

threadRouter.get(
  "/:id/post",
  validateRequestParams(getThreadPostSchema),
  validateRequestQuery(getThreadPostQuerySchema),
  async (req, res) => {
    const { params, query } = req
    const start = query.start
    const limit = query.limit

    const thread = await db.query.Thread.findFirst({
      where: eq(Thread.id, params.id),
    })
    if (!thread)
      return res.status(404).send({ message: `Thread ${params.id} not found` })

    const posts = await db.query.Post.findMany({
      where: eq(Post.threadId, thread.id),
      offset: start,
      orderBy: desc(Post.created),
      limit: limit,
      with: { media: true },
    })

    const retVal = {
        _links: {
          next: "",
          prev: ""
        },
        results: posts
    }
    return res.send(retVal)
  }
)
