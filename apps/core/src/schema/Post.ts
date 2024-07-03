import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { Thread } from "./Thread"

export const Post = pgTable("post", {
    id: varchar("cuid").primaryKey().$defaultFn(createId),
    content: text("content"),
    tripcode: varchar("tripcode"),
    created: timestamp("created").defaultNow().notNull(),
    ip: varchar("ip").notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    hiddenAt: timestamp("hidden_at"),
    hiddenBy: boolean("hidden_by"),
    explicitBan: boolean("explicit_ban").default(false).notNull(),
    threadId: varchar("thread_id").notNull(),
})

export const PostRelations = relations(Post, ({ one }) => ({
    thread: one(Thread, {
        fields: [Post.threadId],
        references: [Thread.id],
    }),
}))

export type Post = typeof Post.$inferSelect
export type InsertPost = typeof Post.$inferInsert
