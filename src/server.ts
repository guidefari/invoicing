import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/bun"
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

app.use("/static/*", serveStatic({ root: "./src/ui" }))

import home from "./ui/routes/home.tsx"
import businessInfoUI from "./ui/routes/business-info.tsx"
import customersUI from "./ui/routes/customers.tsx"
import productsUI from "./ui/routes/products.tsx"
import invoicesUI from "./ui/routes/invoices.tsx"

app.route("/", home)
app.route("/business-info", businessInfoUI)
app.route("/customers", customersUI)
app.route("/products", productsUI)
app.route("/invoices", invoicesUI)
