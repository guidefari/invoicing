import { describe, test, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { CustomerService, CustomerServiceLive } from "./CustomerService.ts"
import { TestDatabaseLive } from "../db/test-utils.ts"
import type { CreateCustomerInput } from "../types/index.ts"

const TestLayer = Layer.provide(CustomerServiceLive, TestDatabaseLive)

const runTest = <A, E>(effect: Effect.Effect<A, E, CustomerService>) =>
  Effect.runPromise(Effect.provide(effect, TestLayer))

describe("CustomerService", () => {
  test("should create a customer", async () => {
    const input: CreateCustomerInput = {
      name: "Acme Corp",
      vatNumber: "VAT123456",
      streetAddress: "123 Main St",
      city: "Johannesburg",
      postalCode: "2000",
      country: "South Africa",
      email: "contact@acme.com",
      phone: "+27 11 123 4567",
    }

    const customer = await runTest(
      Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.create(input)
      })
    )

    expect(customer.id).toBeGreaterThan(0)
    expect(customer.name).toBe(input.name)
    expect(customer.vatNumber).toBe(input.vatNumber)
    expect(customer.email).toBe(input.email)
  })

  test("should list all customers", async () => {
    const input1: CreateCustomerInput = {
      name: "Customer One",
      vatNumber: "VAT111",
      streetAddress: "111 First Ave",
      city: "Cape Town",
      postalCode: "8001",
      country: "South Africa",
      email: "one@test.com",
      phone: "+27 21 111 1111",
    }

    const input2: CreateCustomerInput = {
      name: "Customer Two",
      vatNumber: "VAT222",
      streetAddress: "222 Second Ave",
      city: "Durban",
      postalCode: "4001",
      country: "South Africa",
      email: "two@test.com",
      phone: "+27 31 222 2222",
    }

    const customers = await runTest(
      Effect.gen(function* () {
        const service = yield* CustomerService
        yield* service.create(input1)
        yield* service.create(input2)
        return yield* service.list()
      })
    )

    expect(customers).toHaveLength(2)
    expect(customers[0]?.name).toBe("Customer One")
    expect(customers[1]?.name).toBe("Customer Two")
  })

  test("should get a customer by id", async () => {
    const input: CreateCustomerInput = {
      name: "Test Customer",
      vatNumber: "VAT999",
      streetAddress: "999 Test St",
      city: "Pretoria",
      postalCode: "0001",
      country: "South Africa",
      email: "test@customer.com",
      phone: "+27 12 999 9999",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* CustomerService
        const created = yield* service.create(input)
        return yield* service.get(created.id)
      })
    )

    expect(result).toBeDefined()
    expect(result?.name).toBe(input.name)
    expect(result?.vatNumber).toBe(input.vatNumber)
  })

  test("should update a customer", async () => {
    const input: CreateCustomerInput = {
      name: "Original Name",
      vatNumber: "VAT000",
      streetAddress: "Original St",
      city: "Original City",
      postalCode: "0000",
      country: "South Africa",
      email: "original@test.com",
      phone: "+27 00 000 0000",
    }

    const updated: CreateCustomerInput = {
      ...input,
      name: "Updated Name",
      email: "updated@test.com",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* CustomerService
        const created = yield* service.create(input)
        return yield* service.update(created.id, updated)
      })
    )

    expect(result.name).toBe("Updated Name")
    expect(result.email).toBe("updated@test.com")
    expect(result.vatNumber).toBe(input.vatNumber)
  })

  test("should delete a customer", async () => {
    const input: CreateCustomerInput = {
      name: "Delete Me",
      vatNumber: "VATDEL",
      streetAddress: "Delete St",
      city: "Delete City",
      postalCode: "9999",
      country: "South Africa",
      email: "delete@test.com",
      phone: "+27 99 999 9999",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* CustomerService
        const created = yield* service.create(input)
        yield* service.delete(created.id)
        return yield* service.get(created.id)
      })
    )

    expect(result).toBeUndefined()
  })
})
