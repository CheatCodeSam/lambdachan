import express from "express"
import { z } from "zod"
import {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
} from "zod-express-middleware"
import { db } from "../../db"
import { desc, eq } from "drizzle-orm"
import { Board } from "../../schema/Board"
import { Thread } from "../../schema/Thread"
import { serializeThread } from "../thread/service"

export const boardRouter = express.Router()

const boardSchema = z.object({
  code: z.string(),
  title: z.string(),
  description: z.string(),
})

boardRouter.post("", validateRequestBody(boardSchema), async (req, res) => {
  const { body } = req
  const result = await db.insert(Board).values(body).returning()
  return res.send(result)
})

const boardIdSchema = z.object({
  id: z.string().cuid2(),
})

boardRouter.get(
  "/id/:id",
  validateRequestParams(boardIdSchema),
  async (req, res) => {
    const { params } = req
    const result = await db.query.Board.findFirst({
      where: eq(Board.id, params.id),
    })
    if (!result) return res.status(404).send(`${params.id} not found.`)
    return res.send(result)
  }
)

const boardCodeSchema = z.object({
  code: z.string(),
})

boardRouter.get(
  "/code/:code",
  validateRequestParams(boardCodeSchema),
  async (req, res) => {
    const { params } = req
    const result = await db.query.Board.findFirst({
      where: eq(Board.code, params.code),
    })
    if (!result) return res.status(404).send(`${params.code} not found.`)
    return res.send(result)
  }
)

boardRouter.get("", async (req, res) => {
  const result = await db.select().from(Board)
  res.send(result)
})

const getBoardThreadsSchema = z.object({
  id: z.string().cuid2(),
})

const getBoardThreadsQuerySchema = z.object({
  start: z.number().int().optional(),
  limit: z.number().int().optional(),
})

boardRouter.get(
  "/:id/thread",
  validateRequestParams(getBoardThreadsSchema),
  validateRequestQuery(getBoardThreadsQuerySchema),
  async (req, res) => {
    const { params, query } = req
    const start = query.start
    const limit = query.limit

    const board = await db.query.Board.findFirst({
      where: eq(Board.id, params.id),
    })
    if (!board)
      return res.status(404).send({ message: `board ${params.id} not found` })

    const threads = await db.query.Thread.findMany({
      where: eq(Thread.boardId, board.id),
      offset: start,
      orderBy: desc(Thread.created),
      limit: limit,
    })
    const serializedThreads: Awaited<ReturnType<typeof serializeThread>>[] = []
    for (const t of threads) {
      serializedThreads.push(await serializeThread(t))
    }
    const retval = {
      _links: {
        next: "",
        prev: "",
      },
      result: serializedThreads,
    }
    return res.send(retval)
  }
)
