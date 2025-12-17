import { Hono } from "hono"
import { Effect } from "effect"
import {
  InvoiceService,
  InvoicePDFService,
  AppRuntime,
  type CreateInvoiceInput
} from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  try {
      const program = Effect.gen(function* () {
        const service = yield* InvoiceService
        return yield* service.list()
      })
      const invoices = await AppRuntime.runPromise(program)
      return c.json(invoices)
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
      const body = await c.req.json<CreateInvoiceInput>()
      const program = Effect.gen(function* () {
        const service = yield* InvoiceService
        return yield* service.create(body)
      })
      const invoice = await AppRuntime.runPromise(program)
      return c.json(invoice, 201)
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
        const service = yield* InvoiceService
        return yield* service.get(id)
      })
      const invoice = await AppRuntime.runPromise(program)
      if (!invoice) {
        return c.json({ error: "Invoice not found" }, 404)
      }
      return c.json(invoice)
    } catch (error) {
      console.error("Request error:", error)
      return c.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500
      )
    }
})

app.get("/:id/pdf", async (c) => {
  try {
      const id = Number.parseInt(c.req.param("id"))
      if (isNaN(id)) {
        return c.json({ error: "Invalid ID parameter" }, 400)
    }
      const program = Effect.gen(function* () {
        const service = yield* InvoicePDFService
        return yield* service.generatePDF(id)
      })
      const pdfBuffer = await AppRuntime.runPromise(program)
      
      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
        },
      })
    } catch (error) {
      console.error("Request error:", error)
      return c.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500
      )
    }
})

export default app
