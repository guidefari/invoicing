/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "../Layout.tsx"

const app = new Hono()

app.get("/", (c) => {
  return c.html(
    <Layout title="Dashboard">
      <h1>Dashboard</h1>
      <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
        <div class="card">
          <h2>Invoices</h2>
          <p>Manage your invoices.</p>
          <a href="/invoices" class="btn btn-primary">Go to Invoices</a>
        </div>
        <div class="card">
          <h2>Customers</h2>
          <p>Manage your customers.</p>
          <a href="/customers" class="btn btn-primary">Go to Customers</a>
        </div>
        <div class="card">
          <h2>Products</h2>
          <p>Manage your products.</p>
          <a href="/products" class="btn btn-primary">Go to Products</a>
        </div>
        <div class="card">
          <h2>Business Info</h2>
          <p>Update your business details.</p>
          <a href="/business-info" class="btn btn-primary">Go to Business Info</a>
        </div>
      </div>
    </Layout>
  )
})

export default app
