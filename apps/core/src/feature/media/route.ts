import express from "express"
import { z } from "zod"
import { db } from "../../db"
import { Media } from "../../schema/Media"
import { validateRequestParams } from "zod-express-middleware"
import { eq } from "drizzle-orm"
import { getFile, uploadFile } from "./service"

export const mediaRouter = express.Router()

mediaRouter.post("", async (req, res) => {
  if (!req.files || !req.files.file)
    return res.status(400).send({ message: "No files were uploaded." })
  if (Array.isArray(req.files.file))
    return res.status(400).send({ message: "To many files uploaded." })
  const file = req.files.file

  const media = await db
    .insert(Media)
    .values({
      mimetype: file.mimetype,
      filename: file.name,
      ip: req.ip ?? "null",
    })
    .returning()

  await uploadFile(media[0].key, file.data)

  return res.send(media)
})

const shortMediaParams = z.object({
  key: z.string().cuid2(),
})

mediaRouter.get(
  "/:key",
  validateRequestParams(shortMediaParams),
  async (req, res) => {
    const params = req.params
    const media = await db.query.Media.findFirst({
      where: eq(Media.key, params.key),
    })
    if (!media)
      return res
        .status(404)
        .send({ message: `File with key ${params.key} not found.` })
    return res.redirect(`/media/${media.key}/${media.filename}`)
  }
)

const mediaParams = z.object({
  key: z.string().cuid2(),
  filename: z.string(),
})

mediaRouter.get("/:key/:filename", async (req, res) => {
  const params = req.params
  const media = await db.query.Media.findFirst({
    where: eq(Media.key, params.key),
  })
  if (!media)
    return res
      .status(404)
      .send({ message: `File with key ${params.key} not found.` })
  if (params.filename !== media.filename)
    return res.redirect(`/media/${media.key}/${media.filename}`)
  const file = await getFile(media.key)
  return res
    .set("Content-Type", media.mimetype)
    .set("Content-Disposition", "inline")
    .send(file)
})
