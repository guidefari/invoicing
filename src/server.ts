import { Hono } from "hono"
import { cors } from "hono/cors"
import businessInfo from "./routes/business-info.ts"
import customers from "./routes/customers.ts"
import products from "./routes/products.ts"
import invoices from "./routes/invoices.ts"

const PORT = process.env.PORT || 3333

const app = new Hono()

// Middleware
app.use("/*", cors())

const routes = app
  .route("/api/business-info", businessInfo)
  .route("/api/customers", customers)
  .route("/api/products", products)
  .route("/api/invoices", invoices)

export type AppType = typeof routes

console.log(`API server running on http://localhost:${PORT}`)

export default {
  port: PORT,
  fetch: app.fetch,
}
