import path from "node:path"
import { promises as fs } from "node:fs"

export const uploadFile = async (key: string, data: Buffer) => {
  const filePath = path.join("./uploads/", key)
  await fs.writeFile(filePath, data)
}

export const getFile = async (key: string) => {
  return fs.readFile(`./uploads/${key}`)
}