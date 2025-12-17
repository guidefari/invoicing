import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/drizzle-schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "../invoices.db",
  },
})
