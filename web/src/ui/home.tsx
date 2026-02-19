/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "./Layout.tsx"
import { Effect } from "effect"
import { InvoiceService, CustomerService, ProductService, AppRuntime } from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  const data = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const invoiceService = yield* InvoiceService
      const customerService = yield* CustomerService
      const productService = yield* ProductService
      return {
        invoices: yield* invoiceService.list(),
        customers: yield* customerService.list(),
        products: yield* productService.list(),
      }
    })
  )

  const totalRevenue = data.invoices.reduce((sum, inv) => sum + inv.total, 0)
  const recentInvoices = [...data.invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return c.html(
    <Layout title="Dashboard" currentPath="/">
      <div class="page-header">
        <h1>Dashboard</h1>
        <a href="/invoices/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Invoice
        </a>
      </div>

      {/* Stats row */}
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-label">Total Revenue</div>
          <div class="stat-card-value">{totalRevenue.toFixed(2)}</div>
          <div class="stat-card-sub">across all invoices</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Invoices</div>
          <div class="stat-card-value">{data.invoices.length}</div>
          <div class="stat-card-sub">total created</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Customers</div>
          <div class="stat-card-value">{data.customers.length}</div>
          <div class="stat-card-sub">in your directory</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Products</div>
          <div class="stat-card-value">{data.products.length}</div>
          <div class="stat-card-sub">in your catalog</div>
        </div>
      </div>

      {/* Recent invoices */}
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h2>Recent Invoices</h2>
          <a href="/invoices" class="btn btn-sm btn-outline">View all</a>
        </div>

        {recentInvoices.length > 0 ? (
          <div class="table-container" style="box-shadow: none; border: none; border-radius: 0;">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr>
                    <td>
                      <a href={`/invoices/${invoice.id}`} class="font-semibold">
                        {invoice.invoiceNumber}
                      </a>
                    </td>
                    <td class="text-secondary">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td class="text-secondary">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td class="text-right font-semibold">{invoice.total.toFixed(2)}</td>
                    <td class="text-right td-actions">
                      <a href={`/invoices/${invoice.id}`} class="btn btn-sm btn-ghost">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div class="empty-state" style="padding: 2rem 1rem;">
            <p>No invoices yet.</p>
            <a href="/invoices/new" class="btn btn-primary btn-sm">Create your first invoice</a>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <h3 style="margin-bottom: 0.875rem; color: var(--text-secondary); font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Quick Actions</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
        <a href="/invoices/new" class="quick-card">
          <div class="quick-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>
          <div class="quick-card-body">
            <div class="quick-card-title">New Invoice</div>
            <div class="quick-card-desc">Bill a customer</div>
          </div>
          <svg class="quick-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>

        <a href="/customers/new" class="quick-card">
          <div class="quick-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <div class="quick-card-body">
            <div class="quick-card-title">Add Customer</div>
            <div class="quick-card-desc">Add to your directory</div>
          </div>
          <svg class="quick-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>

        <a href="/products/new" class="quick-card">
          <div class="quick-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div class="quick-card-body">
            <div class="quick-card-title">Add Product</div>
            <div class="quick-card-desc">Expand your catalog</div>
          </div>
          <svg class="quick-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>

        <a href="/business-info" class="quick-card">
          <div class="quick-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          </div>
          <div class="quick-card-body">
            <div class="quick-card-title">Business Settings</div>
            <div class="quick-card-desc">Update your details</div>
          </div>
          <svg class="quick-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </Layout>
  )
})

export default app
