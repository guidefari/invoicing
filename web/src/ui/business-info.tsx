/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "./Layout.tsx"
import { Effect } from "effect"
import { BusinessInfoService, AppRuntime } from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  const businessInfo = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* BusinessInfoService
      return yield* service.get()
    })
  )

  return c.html(
    <Layout title="Business Info">
      <div class="flex justify-between items-center mb-4">
        <h1>Business Info</h1>
        <a href="/" class="btn btn-link">Back to Dashboard</a>
      </div>

      <div class="card">
        <form method="post" action="/business-info">
          <div class="form-group">
            <label for="companyName">Company Name</label>
            <input type="text" id="companyName" name="companyName" value={businessInfo?.companyName || ""} required />
          </div>

          <div class="form-group">
             <label for="vatNumber">VAT Number</label>
             <input type="text" id="vatNumber" name="vatNumber" value={businessInfo?.vatNumber || ""} />
          </div>

          <div class="form-group">
             <label for="defaultVatRate">Default VAT Rate (%)</label>
             <input type="number" id="defaultVatRate" name="defaultVatRate" value={businessInfo?.defaultVatRate || ""} step="0.01" />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value={businessInfo?.email || ""} />
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="text" id="phone" name="phone" value={businessInfo?.phone || ""} />
          </div>

          <div class="form-group">
            <label for="streetAddress">Street Address</label>
            <input type="text" id="streetAddress" name="streetAddress" value={businessInfo?.streetAddress || ""} />
          </div>

          <div class="form-group">
            <label for="city">City</label>
            <input type="text" id="city" name="city" value={businessInfo?.city || ""} />
          </div>

          <div class="form-group">
            <label for="postalCode">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" value={businessInfo?.postalCode || ""} />
          </div>

          <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" name="country" value={businessInfo?.country || ""} />
          </div>

          <h3>Bank Details</h3>

          <div class="form-group">
            <label for="accountHolderName">Account Holder Name</label>
            <input type="text" id="accountHolderName" name="accountHolderName" value={businessInfo?.accountHolderName || ""} />
          </div>

          <div class="form-group">
            <label for="bankName">Bank Name</label>
            <input type="text" id="bankName" name="bankName" value={businessInfo?.bankName || ""} />
          </div>

          <div class="form-group">
            <label for="accountNumber">Account Number</label>
            <input type="text" id="accountNumber" name="accountNumber" value={businessInfo?.accountNumber || ""} />
          </div>

           <div class="form-group">
            <label for="branchCode">Branch Code</label>
            <input type="text" id="branchCode" name="branchCode" value={businessInfo?.branchCode || ""} />
          </div>

          <div class="mt-4">
            <button type="submit" class="btn btn-primary">Save Changes</button>
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
      const service = yield* BusinessInfoService
      const input = {
          companyName: body["companyName"] as string,
          streetAddress: body["streetAddress"] as string,
          city: body["city"] as string,
          postalCode: body["postalCode"] as string,
          country: body["country"] as string,
          vatNumber: body["vatNumber"] as string,
          email: body["email"] as string,
          phone: body["phone"] as string,
          accountHolderName: body["accountHolderName"] as string,
          bankName: body["bankName"] as string,
          accountNumber: body["accountNumber"] as string,
          branchCode: body["branchCode"] as string,
          defaultVatRate: body["defaultVatRate"] ? Number(body["defaultVatRate"]) : null
      }
      yield* service.createOrUpdate(input)
    })
  )

  return c.redirect("/business-info")
})

export default app
