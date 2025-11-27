import { Context, Effect, Layer } from "effect"
import { Database, DatabaseError } from "./Database.ts"
import type { Product, CreateProductInput } from "../types/index.ts"

export class ProductService extends Context.Tag("ProductService")<
  ProductService,
  {
    readonly list: () => Effect.Effect<Product[], DatabaseError>
    readonly get: (id: number) => Effect.Effect<Product | undefined, DatabaseError>
    readonly create: (input: CreateProductInput) => Effect.Effect<Product, DatabaseError>
    readonly update: (id: number, input: CreateProductInput) => Effect.Effect<Product, DatabaseError>
    readonly delete: (id: number) => Effect.Effect<void, DatabaseError>
  }
>() {}

export const ProductServiceLive = Layer.effect(
  ProductService,
  Effect.gen(function* () {
    const db = yield* Database

    return {
      list: () =>
        db.query<Product>(
          `SELECT id, name, description, default_price as defaultPrice, created_at as createdAt
           FROM products ORDER BY name`
        ),

      get: (id: number) =>
        db.get<Product>(
          `SELECT id, name, description, default_price as defaultPrice, created_at as createdAt
           FROM products WHERE id = ?`,
          [id]
        ),

      create: (input: CreateProductInput) =>
        Effect.gen(function* () {
          yield* db.execute(
            `INSERT INTO products (name, description, default_price)
             VALUES (?, ?, ?)`,
            [input.name, input.description, input.defaultPrice]
          )

          const product = yield* db.get<Product>(
            `SELECT id, name, description, default_price as defaultPrice, created_at as createdAt
             FROM products WHERE id = last_insert_rowid()`
          )

          if (!product) {
            return yield* Effect.fail(new DatabaseError("Failed to retrieve created product"))
          }

          return product
        }),

      update: (id: number, input: CreateProductInput) =>
        Effect.gen(function* () {
          yield* db.execute(
            `UPDATE products SET name = ?, description = ?, default_price = ?
             WHERE id = ?`,
            [input.name, input.description, input.defaultPrice, id]
          )

          const product = yield* db.get<Product>(
            `SELECT id, name, description, default_price as defaultPrice, created_at as createdAt
             FROM products WHERE id = ?`,
            [id]
          )

          if (!product) {
            return yield* Effect.fail(new DatabaseError("Product not found after update"))
          }

          return product
        }),

      delete: (id: number) => db.execute("DELETE FROM products WHERE id = ?", [id]),
    }
  })
)
