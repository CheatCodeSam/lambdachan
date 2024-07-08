import { count, eq } from "drizzle-orm"
import { db } from "../../db"
import { Thread } from "../../schema/Thread"
import { Media } from "../../schema/Media"
import { Post } from "../../schema/Post"
import { httpError } from "../../util"

export const serializeThread = (
  thread: Thread,
  replys: number,
  medias: number
) => {
  return {
    ...thread,
    replys,
    medias,
  }
}

export const getAndSerializeThread = async (id: string) => {
  const result = await db.query.Thread.findFirst({
    where: eq(Thread.id, id),
  })
  if (!result) throw httpError(404, `Thread ${id} not found.`)
  const replys = await db
    .select({ count: count() })
    .from(Post)
    .where(eq(Post.threadId, result.id))
  const medias = await db
    .select({ count: count() })
    .from(Post)
    .innerJoin(Media, eq(Post.id, Media.postId))
    .where(eq(Post.threadId, result.id))

  return serializeThread(result, replys[0].count, medias[0].count)
}
