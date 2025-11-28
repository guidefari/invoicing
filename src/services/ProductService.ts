import { Context, Effect, Layer } from "effect"
import { eq, asc } from "drizzle-orm"
import { Database, DatabaseError } from "./Database.ts"
import { products } from "../db/drizzle-schema.ts"
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
    const database = yield* Database

    return {
      list: () =>
        Effect.try({
          try: () => database.db.select().from(products).orderBy(asc(products.name)).all() as Product[],
          catch: (error) => new DatabaseError("Failed to list products", error),
        }),

      get: (id: number) =>
        Effect.try({
          try: () => {
            const result = database.db.select().from(products).where(eq(products.id, id)).get()
            return result as Product | undefined
          },
          catch: (error) => new DatabaseError("Failed to get product", error),
        }),

      create: (input: CreateProductInput) =>
        Effect.gen(function* () {
          yield* Effect.try({
            try: () =>
              database.db
                .insert(products)
                .values({
                  name: input.name,
                  description: input.description,
                  defaultPrice: input.defaultPrice,
                })
                .run(),
            catch: (error) => new DatabaseError("Failed to create product", error),
          })

          const lastId = yield* Effect.try({
            try: () => database.sqlite.query("SELECT last_insert_rowid() as id").get() as { id: number },
            catch: (error) => new DatabaseError("Failed to get last insert ID", error),
          })

          const product = yield* Effect.try({
            try: () => database.db.select().from(products).where(eq(products.id, lastId.id)).get(),
            catch: (error) => new DatabaseError("Failed to retrieve created product", error),
          })

          if (!product) {
            return yield* Effect.fail(new DatabaseError("Failed to retrieve created product"))
          }

          return product as Product
        }),

      update: (id: number, input: CreateProductInput) =>
        Effect.gen(function* () {
          yield* Effect.try({
            try: () =>
              database.db
                .update(products)
                .set({
                  name: input.name,
                  description: input.description,
                  defaultPrice: input.defaultPrice,
                })
                .where(eq(products.id, id))
                .run(),
            catch: (error) => new DatabaseError("Failed to update product", error),
          })

          const product = yield* Effect.try({
            try: () => database.db.select().from(products).where(eq(products.id, id)).get(),
            catch: (error) => new DatabaseError("Failed to retrieve updated product", error),
          })

          if (!product) {
            return yield* Effect.fail(new DatabaseError("Product not found after update"))
          }

          return product as Product
        }),

      delete: (id: number) =>
        Effect.try({
          try: () => {
            database.db.delete(products).where(eq(products.id, id)).run()
          },
          catch: (error) => new DatabaseError("Failed to delete product", error),
        }),
    }
  })
)
