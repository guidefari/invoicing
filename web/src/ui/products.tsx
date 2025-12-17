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
    <Layout title="Products">
      <div class="flex justify-between items-center mb-4">
        <h1>Products</h1>
        <a href="/products/new" class="btn btn-primary">New Product</a>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr>
                <td>{product.name}</td>
                <td>{product.description || "-"}</td>
                <td>{product.defaultPrice.toFixed(2)}</td>
                <td>
                  <a href={`/products/${product.id}`} class="btn btn-link">Edit</a>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colspan={4} style="text-align: center; color: #666;">No products found.</td>
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
    <Layout title="New Product">
      <div class="flex justify-between items-center mb-4">
        <h1>New Product</h1>
        <a href="/products" class="btn btn-link">Back to List</a>
      </div>

      <div class="card">
        <form method="post" action="/products">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description"></textarea>
          </div>

          <div class="form-group">
            <label for="defaultPrice">Price</label>
            <input type="number" id="defaultPrice" name="defaultPrice" step="0.01" required />
          </div>

          <div class="mt-4">
            <button type="submit" class="btn btn-primary">Create Product</button>
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
    <Layout title={`Edit Product: ${product.name}`}>
      <div class="flex justify-between items-center mb-4">
        <h1>Edit Product</h1>
        <div class="flex gap-4">
            <form method="post" action={`/products/${id}/delete`} onsubmit="return confirm('Are you sure?');" style="display:inline;">
                <button type="submit" class="btn btn-danger">Delete</button>
            </form>
            <a href="/products" class="btn btn-link">Back to List</a>
        </div>
      </div>

      <div class="card">
        <form method="post" action={`/products/${id}`}>
          <div class="form-group">
             <label for="name">Name</label>
            <input type="text" id="name" name="name" value={product.name} required />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description">{product.description || ""}</textarea>
          </div>

           <div class="form-group">
            <label for="defaultPrice">Price</label>
            <input type="number" id="defaultPrice" name="defaultPrice" value={product.defaultPrice} step="0.01" required />
          </div>

          <div class="mt-4">
            <button type="submit" class="btn btn-primary">Update Product</button>
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
