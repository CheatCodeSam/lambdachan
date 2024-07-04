import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:xQPM7Jk2cCjN@ep-morning-lake-a4y5o9xc.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
})
