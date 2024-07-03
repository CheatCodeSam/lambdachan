import express from "express"
import { z } from "zod"
import {
    validateRequestBody,
    validateRequestParams,
} from "zod-express-middleware"
import { db } from "../../db"
import { eq } from "drizzle-orm"
import { Board } from "../../schema/Board"

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
    },
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
    },
)

boardRouter.get("", async (req, res) => {
    const result = await db.select().from(Board)
    res.send(result)
})
