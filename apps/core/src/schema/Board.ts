import { createId } from "@paralleldrive/cuid2"
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { Thread } from "./Thread"
import { relations } from "drizzle-orm"

export const Board = pgTable("board", {
  id: varchar("cuid").primaryKey().$defaultFn(createId),
  code: varchar("code").notNull().unique(),
  title: varchar("title").notNull(),
  description: varchar("description").notNull(),
  created: timestamp("created").defaultNow().notNull(),
})

export const BoardRelations = relations(Board, ({ many }) => ({
  threads: many(Thread),
}))

export type Board = typeof Board.$inferSelect
export type InsertBoard = typeof Board.$inferInsert
