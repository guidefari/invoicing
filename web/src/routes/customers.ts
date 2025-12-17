import { Hono } from "hono"
import { Effect } from "effect"
import { CustomerService, AppRuntime, type CreateCustomerInput } from "@invoicing/core"

const app = new Hono()

app.put("/:id", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"))
    if (isNaN(id)) {
        return c.json({ error: "Invalid ID parameter" }, 400)
    }
    const body = await c.req.json<CreateCustomerInput>()
    const program = Effect.gen(function* () {
      const service = yield* CustomerService
      return yield* service.update(id, body)
    })
    const customer = await AppRuntime.runPromise(program)
    return c.json(customer)
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
      const service = yield* CustomerService
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
