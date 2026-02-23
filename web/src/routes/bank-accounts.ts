import { Hono } from "hono"
import { Effect } from "effect"
import { BankAccountService, AppRuntime, type CreateBankAccountInput } from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  try {
    const program = Effect.gen(function* () {
      const service = yield* BankAccountService
      return yield* service.list()
    })
    const bankAccounts = await AppRuntime.runPromise(program)
    return c.json(bankAccounts)
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
    const body = await c.req.json<CreateBankAccountInput>()
    const program = Effect.gen(function* () {
      const service = yield* BankAccountService
      return yield* service.create(body)
    })
    const bankAccount = await AppRuntime.runPromise(program)
    return c.json(bankAccount)
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
    const body = await c.req.json<CreateBankAccountInput>()
    const program = Effect.gen(function* () {
      const service = yield* BankAccountService
      return yield* service.update(id, body)
    })
    const bankAccount = await AppRuntime.runPromise(program)
    return c.json(bankAccount)
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
      const service = yield* BankAccountService
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

app.patch("/:id/default", async (c) => {
  try {
    const id = Number.parseInt(c.req.param("id"))
    if (isNaN(id)) {
      return c.json({ error: "Invalid ID parameter" }, 400)
    }
    const program = Effect.gen(function* () {
      const service = yield* BankAccountService
      return yield* service.setDefault(id)
    })
    const bankAccount = await AppRuntime.runPromise(program)
    return c.json(bankAccount)
  } catch (error) {
    console.error("Request error:", error)
    return c.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500
    )
  }
})

export default app
