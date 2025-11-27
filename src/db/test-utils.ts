import { Effect, Layer } from "effect"
import { Database as SQLiteDatabase } from "bun:sqlite"
import { createTables } from "./schema.ts"
import { Database, DatabaseService } from "../services/Database.ts"

export const createTestDatabase = (): SQLiteDatabase => {
  const db = new SQLiteDatabase(":memory:")
  createTables(db)
  return db
}

export const TestDatabaseLive = Layer.effect(
  Database,
  Effect.sync(() => {
    const db = createTestDatabase()

    return {
      db,
      query: <T>(sql: string, params: unknown[] = []) =>
        Effect.try({
          try: () => db.query(sql).all(...params) as T[],
          catch: (error) => ({ _tag: "DatabaseError" as const, message: "Query failed", cause: error }),
        }),
      execute: (sql: string, params: unknown[] = []) =>
        Effect.try({
          try: () => {
            db.run(sql, ...params)
          },
          catch: (error) => ({ _tag: "DatabaseError" as const, message: "Execute failed", cause: error }),
        }),
      get: <T>(sql: string, params: unknown[] = []) =>
        Effect.try({
          try: () => db.query(sql).get(...params) as T | undefined,
          catch: (error) => ({ _tag: "DatabaseError" as const, message: "Get failed", cause: error }),
        }),
    } satisfies DatabaseService
  })
)
