import express from "express"
import { z } from "zod"
import {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
} from "zod-express-middleware"
import { db } from "../../db"
import { Thread } from "../../schema/Thread"
import { desc, eq } from "drizzle-orm"
import { Board } from "../../schema/Board"
import { Post } from "../../schema/Post"
import { serializeThread } from "./service"
import { insertPostSchema } from "../post/schema"
import { insertPostIntoDb } from "../post/service"

export const threadRouter = express.Router()

const threadSchema = z.object({
  board_id: z.string(),
  title: z.string().optional(),
  post: insertPostSchema,
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
    const thread = (
      await tx
        .insert(Thread)
        .values({ boardId: body.board_id, title: body.title })
        .returning()
    )[0]
    const post = await insertPostIntoDb({
      threadid: thread.id,
      ip: req.ip ?? "null",
      post: body.post,
    })
    return res.json({ ...thread, post })
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
    const thread = await db.query.Thread.findFirst({
      where: eq(Thread.id, params.id),
    })
    if (!thread)
      return res.status(404).send({ message: `Thread ${params.id} not found.` })
    const result = await serializeThread(thread)
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
        prev: "",
      },
      result: posts,
    }
    return res.send(retVal)
  }
)
