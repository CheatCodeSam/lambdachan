import express from "express"
import { z } from "zod"
import { db } from "../../db"
import { Media } from "../../schema/Media"
import { validateRequestParams } from "zod-express-middleware"
import { eq } from "drizzle-orm"
import { getFile, mimetypes, uploadFile } from "./service"
import sharp from "sharp"

export const mediaRouter = express.Router()

mediaRouter.post("", async (req, res) => {
  if (!req.files || !req.files.file)
    return res.status(400).send({ message: "No files were uploaded." })
  if (Array.isArray(req.files.file))
    return res.status(400).send({ message: "To many files uploaded." })
  const file = req.files.file
  if (!mimetypes.includes(file.mimetype as any))
    return res.status(400).send({ message: `"${file.mimetype}" not supported` })

  const media = (
    await db
      .insert(Media)
      .values({
        mimetype: file.mimetype,
        filename: file.name,
        ip: req.ip ?? "null",
      })
      .returning()
  )[0]

  await uploadFile(media.key, file.data)

  const thumbnail = await sharp(file.data)
    .resize(240, null, { fit: "inside" })
    .toBuffer()
  await uploadFile(media.thumbnail, thumbnail)

  return res.send(media)
})

const mediaParams = z.object({
  key: z.string().cuid2(),
})

mediaRouter.get(
  "/:key",
  validateRequestParams(mediaParams),
  async (req, res) => {
    const params = req.params
    const media = await db.query.Media.findFirst({
      where: eq(Media.key, params.key),
    })
    if (!media)
      return res
        .status(404)
        .send({ message: `File with key ${params.key} not found.` })
    const file = await getFile(media.key)
    return res
      .set("Content-Type", media.mimetype)
      .set("Content-Disposition", `inline; filename*="${media.filename}"`)
      .send(file)
  }
)

mediaRouter.get(
  "/thumb/:key",
  validateRequestParams(mediaParams),
  async (req, res) => {
    const params = req.params
    const media = await db.query.Media.findFirst({
      where: eq(Media.key, params.key),
    })
    if (!media)
      return res
        .status(404)
        .send({ message: `File with key ${params.key} not found.` })
    const file = await getFile(media.thumbnail)
    return res
      .set("Content-Type", media.mimetype)
      .set(
        "Content-Disposition",
        `inline; filename*="thumb__${media.filename}"`
      )
      .send(file)
  }
)
