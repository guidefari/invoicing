import { Effect } from "effect"
import { CustomerService } from "./services/CustomerService.ts"
import { ProductService } from "./services/ProductService.ts"
import { InvoiceService } from "./services/InvoiceService.ts"
import { AppLayer } from "./runtime.ts"
import type {
  CreateCustomerInput,
  CreateProductInput,
  CreateInvoiceInput,
} from "./types/index.ts"

const PORT = process.env.PORT || 3000

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  try {
    if (path === "/api/customers" && method === "GET") {
      const program = Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.list()
      })
      const customers = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(customers), { headers })
    }

    if (path.match(/^\/api\/customers\/\d+$/) && method === "GET") {
      const id = Number.parseInt(path.split("/").pop()!)
      const program = Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.get(id)
      })
      const customer = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      if (!customer) {
        return new Response(JSON.stringify({ error: "Customer not found" }), {
          status: 404,
          headers,
        })
      }
      return new Response(JSON.stringify(customer), { headers })
    }

    if (path === "/api/customers" && method === "POST") {
      const body = (await req.json()) as CreateCustomerInput
      const program = Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.create(body)
      })
      const customer = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(customer), { status: 201, headers })
    }

    if (path.match(/^\/api\/customers\/\d+$/) && method === "PUT") {
      const id = Number.parseInt(path.split("/").pop()!)
      const body = (await req.json()) as CreateCustomerInput
      const program = Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.update(id, body)
      })
      const customer = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(customer), { headers })
    }

    if (path.match(/^\/api\/customers\/\d+$/) && method === "DELETE") {
      const id = Number.parseInt(path.split("/").pop()!)
      const program = Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.delete(id)
      })
      await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(null, { status: 204, headers })
    }

    if (path === "/api/products" && method === "GET") {
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.list()
      })
      const products = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(products), { headers })
    }

    if (path.match(/^\/api\/products\/\d+$/) && method === "GET") {
      const id = Number.parseInt(path.split("/").pop()!)
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.get(id)
      })
      const product = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      if (!product) {
        return new Response(JSON.stringify({ error: "Product not found" }), {
          status: 404,
          headers,
        })
      }
      return new Response(JSON.stringify(product), { headers })
    }

    if (path === "/api/products" && method === "POST") {
      const body = (await req.json()) as CreateProductInput
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.create(body)
      })
      const product = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(product), { status: 201, headers })
    }

    if (path.match(/^\/api\/products\/\d+$/) && method === "PUT") {
      const id = Number.parseInt(path.split("/").pop()!)
      const body = (await req.json()) as CreateProductInput
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.update(id, body)
      })
      const product = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(product), { headers })
    }

    if (path.match(/^\/api\/products\/\d+$/) && method === "DELETE") {
      const id = Number.parseInt(path.split("/").pop()!)
      const program = Effect.gen(function* () {
        const service = yield* ProductService
        return yield* service.delete(id)
      })
      await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(null, { status: 204, headers })
    }

    if (path === "/api/invoices" && method === "GET") {
      const program = Effect.gen(function* () {
        const service = yield* InvoiceService
        return yield* service.list()
      })
      const invoices = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(invoices), { headers })
    }

    if (path.match(/^\/api\/invoices\/\d+$/) && method === "GET") {
      const id = Number.parseInt(path.split("/").pop()!)
      const program = Effect.gen(function* () {
        const service = yield* InvoiceService
        return yield* service.get(id)
      })
      const invoice = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      if (!invoice) {
        return new Response(JSON.stringify({ error: "Invoice not found" }), {
          status: 404,
          headers,
        })
      }
      return new Response(JSON.stringify(invoice), { headers })
    }

    if (path === "/api/invoices" && method === "POST") {
      const body = (await req.json()) as CreateInvoiceInput
      const program = Effect.gen(function* () {
        const service = yield* InvoiceService
        return yield* service.create(body)
      })
      const invoice = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      return new Response(JSON.stringify(invoice), { status: 201, headers })
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers,
    })
  } catch (error) {
    console.error("Request error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers }
    )
  }
}

Bun.serve({
  port: PORT,
  fetch: handleRequest,
})

console.log(`API server running on http://localhost:${PORT}`)
