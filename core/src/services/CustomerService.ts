import { Context, Effect, Layer } from "effect"
import { eq, asc } from "drizzle-orm"
import { Database, DatabaseError } from "./Database.ts"
import { customers } from "../db/drizzle-schema.ts"
import type { Customer, CreateCustomerInput } from "../types/index.ts"

export class CustomerService extends Context.Tag("CustomerService")<
  CustomerService,
  {
    readonly list: () => Effect.Effect<Customer[], DatabaseError>
    readonly get: (id: number) => Effect.Effect<Customer | undefined, DatabaseError>
    readonly create: (input: CreateCustomerInput) => Effect.Effect<Customer, DatabaseError>
    readonly update: (id: number, input: CreateCustomerInput) => Effect.Effect<Customer, DatabaseError>
    readonly delete: (id: number) => Effect.Effect<void, DatabaseError>
  }
>() {}

export const CustomerServiceLive = Layer.effect(
  CustomerService,
  Effect.gen(function* () {
    const database = yield* Database

    return {
      list: () =>
        Effect.try({
          try: () => database.db.select().from(customers).orderBy(asc(customers.name)).all() as Customer[],
          catch: (error) => new DatabaseError("Failed to list customers", error),
        }),

      get: (id: number) =>
        Effect.try({
          try: () => {
            const result = database.db.select().from(customers).where(eq(customers.id, id)).get()
            return result as Customer | undefined
          },
          catch: (error) => new DatabaseError("Failed to get customer", error),
        }),

      create: (input: CreateCustomerInput) =>
        Effect.gen(function* () {
          yield* Effect.try({
            try: () =>
              database.db
                .insert(customers)
                .values({
                  name: input.name,
                  vatNumber: input.vatNumber,
                  streetAddress: input.streetAddress,
                  city: input.city,
                  postalCode: input.postalCode,
                  country: input.country,
                  email: input.email,
                  phone: input.phone,
                })
                .run(),
            catch: (error) => new DatabaseError("Failed to create customer", error),
          })

          const lastId = yield* Effect.try({
            try: () => database.sqlite.query("SELECT last_insert_rowid() as id").get() as { id: number },
            catch: (error) => new DatabaseError("Failed to get last insert ID", error),
          })

          const customer = yield* Effect.try({
            try: () => database.db.select().from(customers).where(eq(customers.id, lastId.id)).get(),
            catch: (error) => new DatabaseError("Failed to retrieve created customer", error),
          })

          if (!customer) {
            return yield* Effect.fail(new DatabaseError("Failed to retrieve created customer"))
          }

          return customer as Customer
        }),

      update: (id: number, input: CreateCustomerInput) =>
        Effect.gen(function* () {
          yield* Effect.try({
            try: () =>
              database.db
                .update(customers)
                .set({
                  name: input.name,
                  vatNumber: input.vatNumber,
                  streetAddress: input.streetAddress,
                  city: input.city,
                  postalCode: input.postalCode,
                  country: input.country,
                  email: input.email,
                  phone: input.phone,
                })
                .where(eq(customers.id, id))
                .run(),
            catch: (error) => new DatabaseError("Failed to update customer", error),
          })

          const customer = yield* Effect.try({
            try: () => database.db.select().from(customers).where(eq(customers.id, id)).get(),
            catch: (error) => new DatabaseError("Failed to retrieve updated customer", error),
          })

          if (!customer) {
            return yield* Effect.fail(new DatabaseError("Customer not found after update"))
          }

          return customer as Customer
        }),

      delete: (id: number) =>
        Effect.try({
          try: () => {
            database.db.delete(customers).where(eq(customers.id, id)).run()
          },
          catch: (error) => new DatabaseError("Failed to delete customer", error),
        }),
    }
  })
)
