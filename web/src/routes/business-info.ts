import { Hono } from "hono"
import { Effect } from "effect"
import { BusinessInfoService, AppRuntime, type CreateBusinessInfoInput } from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  try {
    const program = Effect.gen(function* () {
      const service = yield* BusinessInfoService
      return yield* service.get()
    })
    const businessInfo = await AppRuntime.runPromise(program)
    if (!businessInfo) {
      return c.json({ error: "Business info not configured" }, 404)
    }
    return c.json(businessInfo)
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
    const body = await c.req.json<CreateBusinessInfoInput>()
    const program = Effect.gen(function* () {
      const service = yield* BusinessInfoService
      return yield* service.createOrUpdate(body)
    })
    const businessInfo = await AppRuntime.runPromise(program)
    return c.json(businessInfo)
  } catch (error) {
    console.error("Request error:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500
    )
  }
})

app.patch("/", async (c) => {
  try {
    const body = await c.req.json<Partial<CreateBusinessInfoInput>>()
    const program = Effect.gen(function* () {
      const service = yield* BusinessInfoService
      return yield* service.update(body)
    })
    const businessInfo = await AppRuntime.runPromise(program)
    return c.json(businessInfo)
  } catch (error) {
    console.error("Request error:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500
    )
  }
})

export default app
