import { count, eq } from "drizzle-orm"
import { db } from "../../db"
import { Thread } from "../../schema/Thread"
import { Media } from "../../schema/Media"
import { Post } from "../../schema/Post"

export const serializeThread = async (t: Thread) => {
  const { replys, medias } = await getThreadMediaReplyCounts(t)
  return {
    ...t,
    replys,
    medias,
  }
}

export const getThreadMediaReplyCounts = async (t: Thread) => {
  const replys = await db
    .select({ count: count() })
    .from(Post)
    .where(eq(Post.threadId, t.id))
  const medias = await db
    .select({ count: count() })
    .from(Post)
    .innerJoin(Media, eq(Post.id, Media.postId))
    .where(eq(Post.threadId, t.id))
  return { replys: replys[0].count, medias: medias[0].count }
}
