/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "./Layout.tsx"
import { Effect } from "effect"
import { CustomerService, AppRuntime } from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  const customers = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* CustomerService
      return yield* service.list()
    })
  )

  return c.html(
    <Layout title="Customers" currentPath="/customers">
      <div class="page-header">
        <h1>Customers</h1>
        <a href="/customers/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Customer
        </a>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr>
                <td class="font-medium">{customer.name}</td>
                <td class="text-secondary">{customer.email || "—"}</td>
                <td class="text-secondary">{customer.phone || "—"}</td>
                <td class="text-secondary">{customer.city || "—"}</td>
                <td class="text-right td-actions">
                  <a href={`/customers/${customer.id}`} class="btn btn-sm btn-outline">Edit</a>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colspan={5}>
                  <div class="empty-state">
                    <p>No customers yet. Add your first customer to get started.</p>
                    <a href="/customers/new" class="btn btn-primary btn-sm">Add Customer</a>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
})

app.get("/new", (c) => {
  return c.html(
    <Layout title="New Customer" currentPath="/customers">
      <div class="page-header">
        <h1>New Customer</h1>
        <a href="/customers" class="btn btn-outline">Back to Customers</a>
      </div>

      <div class="card">
        <form method="post" action="/customers">
          <div class="form-section">
            <div class="form-section-title">Contact Details</div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="name">Name <span class="required">*</span></label>
                <input type="text" id="name" name="name" required />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" />
              </div>

              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" id="phone" name="phone" />
              </div>

              <div class="form-group">
                <label for="vatNumber">VAT Number</label>
                <input type="text" id="vatNumber" name="vatNumber" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Address</div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="streetAddress">Street Address</label>
                <input type="text" id="streetAddress" name="streetAddress" />
              </div>

              <div class="form-group">
                <label for="city">City</label>
                <input type="text" id="city" name="city" />
              </div>

              <div class="form-group">
                <label for="postalCode">Postal Code</label>
                <input type="text" id="postalCode" name="postalCode" />
              </div>

              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" name="country" />
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button type="submit" class="btn btn-primary">Create Customer</button>
            <a href="/customers" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    </Layout>
  )
})

app.post("/", async (c) => {
  const body = await c.req.parseBody()

  await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* CustomerService
       yield* service.create({
        name: body["name"] as string,
        vatNumber: (body["vatNumber"] as string) || null,
        email: (body["email"] as string) || "",
        phone: (body["phone"] as string) || "",
        streetAddress: (body["streetAddress"] as string) || "",
        city: (body["city"] as string) || "",
        postalCode: (body["postalCode"] as string) || "",
        country: (body["country"] as string) || "",
      })
    })
  )

  return c.redirect("/customers")
})

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  if (isNaN(id)) return c.text("Invalid ID", 400)

  const customer = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* CustomerService
      return yield* service.get(id)
    })
  )

  if (!customer) return c.text("Customer not found", 404)

  return c.html(
    <Layout title={`${customer.name}`} currentPath="/customers">
      <div class="page-header">
        <h1>{customer.name}</h1>
        <div class="flex gap-2">
          <a href="/customers" class="btn btn-outline">Back to Customers</a>
          <form method="post" action={`/customers/${id}/delete`} onsubmit="return confirm('Delete this customer?');" style="display:inline;">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </div>
      </div>

      <div class="card">
        <form method="post" action={`/customers/${id}`}>
          <div class="form-section">
            <div class="form-section-title">Contact Details</div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="name">Name <span class="required">*</span></label>
                <input type="text" id="name" name="name" value={customer.name} required />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value={customer.email || ""} />
              </div>

              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" id="phone" name="phone" value={customer.phone || ""} />
              </div>

              <div class="form-group">
                <label for="vatNumber">VAT Number</label>
                <input type="text" id="vatNumber" name="vatNumber" value={customer.vatNumber || ""} />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Address</div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="streetAddress">Street Address</label>
                <input type="text" id="streetAddress" name="streetAddress" value={customer.streetAddress || ""} />
              </div>

              <div class="form-group">
                <label for="city">City</label>
                <input type="text" id="city" name="city" value={customer.city || ""} />
              </div>

              <div class="form-group">
                <label for="postalCode">Postal Code</label>
                <input type="text" id="postalCode" name="postalCode" value={customer.postalCode || ""} />
              </div>

              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" name="country" value={customer.country || ""} />
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <a href="/customers" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    </Layout>
  )
})

app.post("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  if (isNaN(id)) return c.text("Invalid ID", 400)

  const body = await c.req.parseBody()

  await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* CustomerService
       yield* service.update(id, {
        name: body["name"] as string,
        vatNumber: (body["vatNumber"] as string) || null,
        email: (body["email"] as string) || "",
        phone: (body["phone"] as string) || "",
        streetAddress: (body["streetAddress"] as string) || "",
        city: (body["city"] as string) || "",
        postalCode: (body["postalCode"] as string) || "",
        country: (body["country"] as string) || "",
      })
    })
  )

  return c.redirect("/customers")
})

app.post("/:id/delete", async (c) => {
    const id = Number(c.req.param("id"))
    if (isNaN(id)) return c.text("Invalid ID", 400)

    await AppRuntime.runPromise(
        Effect.gen(function* () {
            const service = yield* CustomerService
            yield* service.delete(id)
        })
    )
    return c.redirect("/customers")
})

export default app
