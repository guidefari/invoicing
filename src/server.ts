import { Effect } from "effect"
import { CustomerService } from "./services/CustomerService.ts"
import { ProductService } from "./services/ProductService.ts"
import { InvoiceService } from "./services/InvoiceService.ts"
import { InvoicePDFService } from "./services/InvoicePDFService.ts"
import { BusinessInfoService } from "./services/BusinessInfoService.ts"
import { AppLayer } from "./runtime.ts"
import type {
  CreateCustomerInput,
  CreateProductInput,
  CreateInvoiceInput,
  CreateBusinessInfoInput,
} from "./types/index.ts"

const PORT = process.env.PORT || 3333

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}



function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers })
}

function notFoundResponse(message = "Not found"): Response {
  return jsonResponse({ error: message }, 404)
}

function errorResponse(error: unknown): Response {
  console.error("Request error:", error)
  return jsonResponse(
    { error: error instanceof Error ? error.message : "Internal server error" },
    500
  )
}

const routes = {
  "/api/business-info": {
    GET: async (_req: Request) => {
      try {
        const program = Effect.gen(function* () {
          const service = yield* BusinessInfoService
          return yield* service.get()
        })
        const businessInfo = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        if (!businessInfo) {
          return notFoundResponse("Business info not configured")
        }
        return jsonResponse(businessInfo)
      } catch (error) {
        return errorResponse(error)
      }
    },
    POST: async (req: Request) => {
      try {
        const body = (await req.json()) as CreateBusinessInfoInput
        const program = Effect.gen(function* () {
          const service = yield* BusinessInfoService
          return yield* service.createOrUpdate(body)
        })
        const businessInfo = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(businessInfo)
      } catch (error) {
        return errorResponse(error)
      }
    },
    PUT: async (req: Request) => {
      console.log('req:', JSON.stringify(req.params))
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const body = (await req.json()) as CreateCustomerInput
        const program = Effect.gen(function* () {
          const service = yield* CustomerService
          return yield* service.update(id, body)
        })
        const customer = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(customer)
      } catch (error) {
        return errorResponse(error)
      }
    },
    DELETE: async (req: Request) => {
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const program = Effect.gen(function* () {
          const service = yield* CustomerService
          return yield* service.delete(id)
        })
        await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return new Response(null, { status: 204, headers })
      } catch (error) {
        return errorResponse(error)
      }
    },
    OPTIONS: (_req: Request) => new Response(null, { status: 204, headers }),
  },
  "/api/products": {
    GET: async (_req: Request) => {
      try {
        const program = Effect.gen(function* () {
          const service = yield* ProductService
          return yield* service.list()
        })
        const products = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(products)
      } catch (error) {
        return errorResponse(error)
      }
    },
    POST: async (req: Request) => {
      try {
        const body = (await req.json()) as CreateProductInput
        const program = Effect.gen(function* () {
          const service = yield* ProductService
          return yield* service.create(body)
        })
        const product = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(product, 201)
      } catch (error) {
        return errorResponse(error)
      }
    },
    OPTIONS: (_req: Request) => new Response(null, { status: 204, headers }),
  },
  "/api/products/:id": {
    GET: async (req: Request) => {
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const program = Effect.gen(function* () {
          const service = yield* ProductService
          return yield* service.get(id)
        })
        const product = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        if (!product) {
          return notFoundResponse("Product not found")
        }
        return jsonResponse(product)
      } catch (error) {
        return errorResponse(error)
      }
    },
    PUT: async (req: Request) => {
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const body = (await req.json()) as CreateProductInput
        const program = Effect.gen(function* () {
          const service = yield* ProductService
          return yield* service.update(id, body)
        })
        const product = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(product)
      } catch (error) {
        return errorResponse(error)
      }
    },
    DELETE: async (req: Request) => {
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const program = Effect.gen(function* () {
          const service = yield* ProductService
          return yield* service.delete(id)
        })
        await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return new Response(null, { status: 204, headers })
      } catch (error) {
        return errorResponse(error)
      }
    },
    OPTIONS: (_req: Request) => new Response(null, { status: 204, headers }),
  },
  "/api/invoices": {
    GET: async (_req: Request) => {
      try {
        const program = Effect.gen(function* () {
          const service = yield* InvoiceService
          return yield* service.list()
        })
        const invoices = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(invoices)
      } catch (error) {
        return errorResponse(error)
      }
    },
    POST: async (req: Request) => {
      try {
        const body = (await req.json()) as CreateInvoiceInput
        const program = Effect.gen(function* () {
          const service = yield* InvoiceService
          return yield* service.create(body)
        })
        const invoice = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return jsonResponse(invoice, 201)
      } catch (error) {
        return errorResponse(error)
      }
    },
    OPTIONS: (_req: Request) => new Response(null, { status: 204, headers }),
  },
  "/api/invoices/:id": {
    GET: async (req: Request) => {
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const program = Effect.gen(function* () {
          const service = yield* InvoiceService
          return yield* service.get(id)
        })
        const invoice = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        if (!invoice) {
          return notFoundResponse("Invoice not found")
        }
        return jsonResponse(invoice)
      } catch (error) {
        return errorResponse(error)
      }
    },
    OPTIONS: (_req: Request) => new Response(null, { status: 204, headers }),
  },
  "/api/invoices/:id/pdf": {
    GET: async (req: Request) => {
      try {
        const idParam = req.params?.id
        if (!idParam) {
          return notFoundResponse("ID parameter missing")
        }
        const id = Number.parseInt(idParam)
        const program = Effect.gen(function* () {
          const service = yield* InvoicePDFService
          return yield* service.generatePDF(id)
        })
        const pdfBuffer = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
        return new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
            "Access-Control-Allow-Origin": "*",
          },
        })
      } catch (error) {
        return errorResponse(error)
      }
    },
    OPTIONS: (_req: Request) => new Response(null, { status: 204, headers }),
  },
}

// Extend Request interface to include params (added by Bun's routing)
declare global {
  interface Request {
    params: Record<string, string | undefined>
  }
}

Bun.serve({
  port: PORT,
  routes,
})

console.log(`API server running on http://localhost:${PORT}`)
