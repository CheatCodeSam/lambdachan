import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { timestamp, boolean, pgTable, varchar } from "drizzle-orm/pg-core"
import { Board } from "./Board"
import { Post } from "./Post"

export const Thread = pgTable("thread", {
    id: varchar("cuid").primaryKey().$defaultFn(createId),
    title: varchar("title"),
    pinned: boolean("pinned").default(false).notNull(),
    boardId: varchar("board_id").notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    hiddenAt: timestamp("hidden_at"),
    hiddenBy: varchar("hidden_by"),
})

export const ThreadRelations = relations(Thread, ({ one, many }) => ({
    board: one(Board, {
        fields: [Thread.boardId],
        references: [Board.id],
    }),
    posts: many(Post),
}))

export type Thread = typeof Thread.$inferSelect
export type InsertThread = typeof Thread.$inferInsert
