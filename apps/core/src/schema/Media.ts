import { createId } from "@paralleldrive/cuid2"
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { Post } from "./Post"
import { relations } from "drizzle-orm"

export const Media = pgTable("media", {
  key: varchar("cuid").primaryKey().$defaultFn(createId),
  postId: varchar("post_id"),
  mimetype: varchar("mimetype").notNull(),
  filename: varchar("filename").notNull(),
  ip: varchar("ip").notNull(),
  created: timestamp("created").defaultNow().notNull(),
})

export const MediaRelations = relations(Media, ({ one }) => ({
  post: one(Post, {
    fields: [Media.postId],
    references: [Post.id],
  }),
}))

export type Media = typeof Media.$inferSelect
export type InsertMedia = typeof Media.$inferInsert
