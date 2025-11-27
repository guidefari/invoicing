import { Context, Effect, Layer } from "effect"
import { Database, DatabaseError } from "./Database.ts"
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
    const db = yield* Database

    return {
      list: () =>
        db.query<Customer>(
          `SELECT id, name, vat_number as vatNumber, street_address as streetAddress,
           city, postal_code as postalCode, country, email, phone, created_at as createdAt
           FROM customers ORDER BY name`
        ),

      get: (id: number) =>
        db.get<Customer>(
          `SELECT id, name, vat_number as vatNumber, street_address as streetAddress,
           city, postal_code as postalCode, country, email, phone, created_at as createdAt
           FROM customers WHERE id = ?`,
          [id]
        ),

      create: (input: CreateCustomerInput) =>
        Effect.gen(function* () {
          yield* db.execute(
            `INSERT INTO customers (name, vat_number, street_address, city, postal_code, country, email, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              input.name,
              input.vatNumber,
              input.streetAddress,
              input.city,
              input.postalCode,
              input.country,
              input.email,
              input.phone,
            ]
          )

          const customer = yield* db.get<Customer>(
            `SELECT id, name, vat_number as vatNumber, street_address as streetAddress,
             city, postal_code as postalCode, country, email, phone, created_at as createdAt
             FROM customers WHERE id = last_insert_rowid()`
          )

          if (!customer) {
            return yield* Effect.fail(new DatabaseError("Failed to retrieve created customer"))
          }

          return customer
        }),

      update: (id: number, input: CreateCustomerInput) =>
        Effect.gen(function* () {
          yield* db.execute(
            `UPDATE customers SET name = ?, vat_number = ?, street_address = ?,
             city = ?, postal_code = ?, country = ?, email = ?, phone = ?
             WHERE id = ?`,
            [
              input.name,
              input.vatNumber,
              input.streetAddress,
              input.city,
              input.postalCode,
              input.country,
              input.email,
              input.phone,
              id,
            ]
          )

          const customer = yield* db.get<Customer>(
            `SELECT id, name, vat_number as vatNumber, street_address as streetAddress,
             city, postal_code as postalCode, country, email, phone, created_at as createdAt
             FROM customers WHERE id = ?`,
            [id]
          )

          if (!customer) {
            return yield* Effect.fail(new DatabaseError("Customer not found after update"))
          }

          return customer
        }),

      delete: (id: number) => db.execute("DELETE FROM customers WHERE id = ?", [id]),
    }
  })
)
