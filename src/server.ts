import { Hono } from "hono"
import { cors } from "hono/cors"
import { Effect } from "effect"
import { CustomerService } from "./services/CustomerService.ts"
import { ProductService } from "./services/ProductService.ts"
import { InvoiceService } from "./services/InvoiceService.ts"
import { InvoicePDFService } from "./services/InvoicePDFService.ts"
import { BusinessInfoService } from "./services/BusinessInfoService.ts"
import { AppRuntime } from "./runtime.ts"
import type {
  CreateCustomerInput,
  CreateProductInput,
  CreateInvoiceInput,
  CreateBusinessInfoInput,
} from "./types/index.ts"

const PORT = process.env.PORT || 3333

const app = new Hono()

// Middleware
app.use("/*", cors())

const routes = app
  // Business Info
  .get("/api/business-info", async (c) => {
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
  .post("/api/business-info", async (c) => {
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
  .patch("/api/business-info", async (c) => {
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
  
  // Customers (Migrated from Business Info PUT/DELETE)
  .put("/api/customers/:id", async (c) => {
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
  .delete("/api/customers/:id", async (c) => {
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

  // Products
  .get("/api/products", async (c) => {
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
  .post("/api/products", async (c) => {
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
  .get("/api/products/:id", async (c) => {
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
  .put("/api/products/:id", async (c) => {
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
  .delete("/api/products/:id", async (c) => {
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

  // Invoices
  .get("/api/invoices", async (c) => {
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
  .post("/api/invoices", async (c) => {
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
  .get("/api/invoices/:id", async (c) => {
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
  .get("/api/invoices/:id/pdf", async (c) => {
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
            // CORS headers are handled by middleware, but if we need specific ones we can add them.
            // Hono middleware handles Access-Control-Allow-Origin: *
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

export type AppType = typeof routes

console.log(`API server running on http://localhost:${PORT}`)

export default {
  port: PORT,
  fetch: app.fetch,
}
