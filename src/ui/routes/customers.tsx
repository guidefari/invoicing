/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "../Layout.tsx"
import { Effect } from "effect"
import { CustomerService } from "../../services/CustomerService.ts"
import { AppRuntime } from "../../runtime.ts"

const app = new Hono()

app.get("/", async (c) => {
  const customers = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* CustomerService
      return yield* service.list()
    })
  )

  return c.html(
    <Layout title="Customers">
      <div class="flex justify-between items-center mb-4">
        <h1>Customers</h1>
        <a href="/customers/new" class="btn btn-primary">New Customer</a>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr>
                <td>{customer.name}</td>
                <td>{customer.email || "-"}</td>
                <td>{customer.phone || "-"}</td>
                <td>
                  <a href={`/customers/${customer.id}`} class="btn btn-link">Edit</a>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colspan={4} style="text-align: center; color: #666;">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div class="mt-4">
         <a href="/" class="btn btn-link">Back to Dashboard</a>
      </div>
    </Layout>
  )
})

app.get("/new", (c) => {
  return c.html(
    <Layout title="New Customer">
      <div class="flex justify-between items-center mb-4">
        <h1>New Customer</h1>
        <a href="/customers" class="btn btn-link">Back to List</a>
      </div>

      <div class="card">
        <form method="post" action="/customers">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div class="form-group">
            <label for="vatNumber">VAT Number</label>
            <input type="text" id="vatNumber" name="vatNumber" />
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

          <div class="mt-4">
            <button type="submit" class="btn btn-primary">Create Customer</button>
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
    <Layout title={`Edit Customer: ${customer.name}`}>
      <div class="flex justify-between items-center mb-4">
        <h1>Edit Customer</h1>
        <div class="flex gap-4">
            <form method="post" action={`/customers/${id}/delete`} onsubmit="return confirm('Are you sure?');" style="display:inline;">
                <button type="submit" class="btn btn-danger">Delete</button>
            </form>
            <a href="/customers" class="btn btn-link">Back to List</a>
        </div>
      </div>

      <div class="card">
        <form method="post" action={`/customers/${id}`}>
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" value={customer.name} required />
          </div>

          <div class="form-group">
            <label for="vatNumber">VAT Number</label>
            <input type="text" id="vatNumber" name="vatNumber" value={customer.vatNumber || ""} />
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

          <div class="mt-4">
            <button type="submit" class="btn btn-primary">Update Customer</button>
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
