import { drizzle } from "drizzle-orm/postgres-js"
import * as Thread from "./schema/Thread"
import * as Post from "./schema/Post"
import * as Board from "./schema/Board"
import postgres from "postgres"

const client = postgres(
  "postgresql://neondb_owner:xQPM7Jk2cCjN@ep-morning-lake-a4y5o9xc.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

export const db = drizzle(client, { schema: { ...Board, ...Post, ...Thread } })
