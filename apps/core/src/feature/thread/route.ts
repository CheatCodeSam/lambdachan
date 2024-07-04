import express from "express"
import { z } from "zod"
import {
  validateRequestBody,
  validateRequestParams,
} from "zod-express-middleware"
import { db } from "../../db"
import { Thread } from "../../schema/Thread"
import { eq } from "drizzle-orm"
import { Board } from "../../schema/Board"
import { Post } from "../../schema/Post"

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
    return res.send(result)
  }
)
