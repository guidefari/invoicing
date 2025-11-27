import { Context, Effect, Layer } from "effect"
import { Database as SQLiteDatabase } from "bun:sqlite"
import { initializeDatabase } from "../db/schema.ts"

export class DatabaseError {
  readonly _tag = "DatabaseError"
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export interface DatabaseService {
  readonly db: SQLiteDatabase
  readonly query: <T>(sql: string, params?: unknown[]) => Effect.Effect<T[], DatabaseError>
  readonly execute: (sql: string, params?: unknown[]) => Effect.Effect<void, DatabaseError>
  readonly get: <T>(sql: string, params?: unknown[]) => Effect.Effect<T | undefined, DatabaseError>
}

export class Database extends Context.Tag("Database")<Database, DatabaseService>() {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.sync(() => {
    const db = initializeDatabase("./invoices.db")

    return {
      db,
      query: <T>(sql: string, params: unknown[] = []) =>
        Effect.try({
          try: () => db.query(sql).all(...params) as T[],
          catch: (error) => new DatabaseError("Query failed", error),
        }),
      execute: (sql: string, params: unknown[] = []) =>
        Effect.try({
          try: () => {
            db.run(sql, ...params)
          },
          catch: (error) => new DatabaseError("Execute failed", error),
        }),
      get: <T>(sql: string, params: unknown[] = []) =>
        Effect.try({
          try: () => db.query(sql).get(...params) as T | undefined,
          catch: (error) => new DatabaseError("Get failed", error),
        }),
    }
  })
)
