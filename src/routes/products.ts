import { Hono } from "hono"
import { Effect } from "effect"
import { ProductService } from "../services/ProductService.ts"
import { AppRuntime } from "../runtime.ts"
import type { CreateProductInput } from "../types/index.ts"

const app = new Hono()

app.get("/", async (c) => {
  try {
    const program = Effect.gen(function* () {
      const service = yield* ProductService
      return yield* service.list()
    })
    const products = await AppRuntime.runPromise(program)
    return c.json(products)
  } catch (error) {
    console.error("Request error:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500
    )
  }
})

app.post("/", async (c) => {
    try {
      const body = await c.req.json<CreateProductInput>()
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.create(body)
      })
      const product = await AppRuntime.runPromise(program)
      return c.json(product, 201)
    } catch (error) {
      console.error("Request error:", error)
      return c.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500
      )
    }
})

app.get("/:id", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"))
      if (isNaN(id)) {
        return c.json({ error: "Invalid ID parameter" }, 400)
    }
    const program = Effect.gen(function* () {
      const service = yield* ProductService
      return yield* service.get(id)
    })
    const product = await AppRuntime.runPromise(program)
    if (!product) {
      return c.json({ error: "Product not found" }, 404)
    }
    return c.json(product)
  } catch (error) {
    console.error("Request error:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500
    )
  }
})

app.put("/:id", async (c) => {
  try {
      const id = Number.parseInt(c.req.param("id"))
      if (isNaN(id)) {
        return c.json({ error: "Invalid ID parameter" }, 400)
    }
      const body = await c.req.json<CreateProductInput>()
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.update(id, body)
      })
      const product = await AppRuntime.runPromise(program)
      return c.json(product)
    } catch (error) {
      console.error("Request error:", error)
      return c.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500
      )
    }
})

app.delete("/:id", async (c) => {
    try {
      const id = Number.parseInt(c.req.param("id"))
      if (isNaN(id)) {
        return c.json({ error: "Invalid ID parameter" }, 400)
    }
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.delete(id)
      })
      await AppRuntime.runPromise(program)
      return c.body(null, 204)
    } catch (error) {
      console.error("Request error:", error)
      return c.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500
      )
    }
})

export default app
