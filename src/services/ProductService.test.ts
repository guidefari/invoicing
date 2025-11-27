import { describe, test, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { ProductService, ProductServiceLive } from "./ProductService.ts"
import { TestDatabaseLive } from "../db/test-utils.ts"
import type { CreateProductInput } from "../types/index.ts"

const TestLayer = Layer.provide(ProductServiceLive, TestDatabaseLive)

const runTest = <A, E>(effect: Effect.Effect<A, E, ProductService>) =>
  Effect.runPromise(Effect.provide(effect, TestLayer))

describe("ProductService", () => {
  test("should create a product", async () => {
    const input: CreateProductInput = {
      name: "Web Development",
      description: "Custom web application development",
      defaultPrice: 15000.0,
    }

    const product = await runTest(
      Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.create(input)
      })
    )

    expect(product.id).toBeGreaterThan(0)
    expect(product.name).toBe(input.name)
    expect(product.description).toBe(input.description)
    expect(product.defaultPrice).toBe(input.defaultPrice)
  })

  test("should list all products", async () => {
    const input1: CreateProductInput = {
      name: "Consulting",
      description: "Technical consulting services",
      defaultPrice: 2500.0,
    }

    const input2: CreateProductInput = {
      name: "Design",
      description: null,
      defaultPrice: 5000.0,
    }

    const products = await runTest(
      Effect.gen(function* () {
        const service = yield* ProductService
        yield* service.create(input1)
        yield* service.create(input2)
        return yield* service.list()
      })
    )

    expect(products).toHaveLength(2)
    expect(products[0].name).toBe("Consulting")
    expect(products[1].name).toBe("Design")
  })

  test("should get a product by id", async () => {
    const input: CreateProductInput = {
      name: "Test Product",
      description: "A test product",
      defaultPrice: 1000.0,
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* ProductService
        const created = yield* service.create(input)
        return yield* service.get(created.id)
      })
    )

    expect(result).toBeDefined()
    expect(result?.name).toBe(input.name)
    expect(result?.defaultPrice).toBe(input.defaultPrice)
  })

  test("should update a product", async () => {
    const input: CreateProductInput = {
      name: "Original Product",
      description: "Original description",
      defaultPrice: 1000.0,
    }

    const updated: CreateProductInput = {
      name: "Updated Product",
      description: "Updated description",
      defaultPrice: 1500.0,
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* ProductService
        const created = yield* service.create(input)
        return yield* service.update(created.id, updated)
      })
    )

    expect(result.name).toBe("Updated Product")
    expect(result.description).toBe("Updated description")
    expect(result.defaultPrice).toBe(1500.0)
  })

  test("should delete a product", async () => {
    const input: CreateProductInput = {
      name: "Delete Me",
      description: "To be deleted",
      defaultPrice: 100.0,
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* ProductService
        const created = yield* service.create(input)
        yield* service.delete(created.id)
        return yield* service.get(created.id)
      })
    )

    expect(result).toBeNull()
  })
})
