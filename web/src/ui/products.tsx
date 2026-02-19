/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "./Layout.tsx"
import { Effect } from "effect"
import { ProductService, AppRuntime } from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  const products = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* ProductService
      return yield* service.list()
    })
  )

  return c.html(
    <Layout title="Products" currentPath="/products">
      <div class="page-header">
        <h1>Products</h1>
        <a href="/products/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Product
        </a>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Default Price</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr>
                <td class="font-medium">{product.name}</td>
                <td class="text-secondary">{product.description || "—"}</td>
                <td class="font-semibold">{product.defaultPrice.toFixed(2)}</td>
                <td class="text-right td-actions">
                  <a href={`/products/${product.id}`} class="btn btn-sm btn-outline">Edit</a>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colspan={4}>
                  <div class="empty-state">
                    <p>No products yet. Add items to your catalog to use them on invoices.</p>
                    <a href="/products/new" class="btn btn-primary btn-sm">Add Product</a>
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
    <Layout title="New Product" currentPath="/products">
      <div class="page-header">
        <h1>New Product</h1>
        <a href="/products" class="btn btn-outline">Back to Products</a>
      </div>

      <div class="card">
        <form method="post" action="/products">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="name">Name <span class="required">*</span></label>
              <input type="text" id="name" name="name" required />
            </div>

            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea id="description" name="description"></textarea>
            </div>

            <div class="form-group">
              <label for="defaultPrice">Default Price <span class="required">*</span></label>
              <input type="number" id="defaultPrice" name="defaultPrice" step="0.01" min="0" required />
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">Create Product</button>
            <a href="/products" class="btn btn-ghost">Cancel</a>
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
      const service = yield* ProductService
      yield* service.create({
        name: body["name"] as string,
        description: (body["description"] as string) || null,
        defaultPrice: Number(body["defaultPrice"]),
      })
    })
  )

  return c.redirect("/products")
})

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  if (isNaN(id)) return c.text("Invalid ID", 400)

  const product = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* ProductService
      return yield* service.get(id)
    })
  )

  if (!product) return c.text("Product not found", 404)

  return c.html(
    <Layout title={`${product.name}`} currentPath="/products">
      <div class="page-header">
        <h1>{product.name}</h1>
        <div class="flex gap-2">
          <a href="/products" class="btn btn-outline">Back to Products</a>
          <form method="post" action={`/products/${id}/delete`} onsubmit="return confirm('Delete this product?');" style="display:inline;">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </div>
      </div>

      <div class="card">
        <form method="post" action={`/products/${id}`}>
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="name">Name <span class="required">*</span></label>
              <input type="text" id="name" name="name" value={product.name} required />
            </div>

            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea id="description" name="description">{product.description || ""}</textarea>
            </div>

            <div class="form-group">
              <label for="defaultPrice">Default Price <span class="required">*</span></label>
              <input type="number" id="defaultPrice" name="defaultPrice" value={product.defaultPrice} step="0.01" min="0" required />
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <a href="/products" class="btn btn-ghost">Cancel</a>
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
      const service = yield* ProductService
      yield* service.update(id, {
        name: body["name"] as string,
        description: (body["description"] as string) || null,
        defaultPrice: Number(body["defaultPrice"]),
      })
    })
  )

  return c.redirect("/products")
})

app.post("/:id/delete", async (c) => {
    const id = Number(c.req.param("id"))
    if (isNaN(id)) return c.text("Invalid ID", 400)

    await AppRuntime.runPromise(
        Effect.gen(function* () {
            const service = yield* ProductService
            yield* service.delete(id)
        })
    )
    return c.redirect("/products")
})

export default app
