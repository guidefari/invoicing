/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono"
import { Layout } from "./Layout.tsx"
import { Effect } from "effect"
import {
  InvoiceService,
  CustomerService,
  ProductService,
  AppRuntime
} from "@invoicing/core"

const app = new Hono()

app.get("/", async (c) => {
  const invoices = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* InvoiceService
      return yield* service.list()
    })
  )

  return c.html(
    <Layout title="Invoices">
      <div class="flex justify-between items-center mb-4">
        <h1>Invoices</h1>
        <a href="/invoices/new" class="btn btn-primary">New Invoice</a>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr>
                <td>{invoice.invoiceNumber}</td>
                <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td>{invoice.total.toFixed(2)}</td>
                <td>
                  <a href={`/invoices/${invoice.id}`} class="btn btn-outline text-sm">View</a>
                </td>
              </tr>
            ))}
             {invoices.length === 0 && (
              <tr>
                <td colspan={5} class="text-secondary" style="text-align: center;">No invoices found.</td>
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

app.get("/new", async (c) => {
  const data = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const customerService = yield* CustomerService
      const productService = yield* ProductService
      return {
        customers: yield* customerService.list(),
        products: yield* productService.list(),
      }
    })
  )

  return c.html(
    <Layout title="New Invoice">
      <div class="flex justify-between items-center mb-4">
        <h1>New Invoice</h1>
        <a href="/invoices" class="btn btn-link">Back to List</a>
      </div>

      <div class="card">
        <form id="invoiceForm">
          <div class="form-group">
            <label for="customerId">Customer</label>
            <select id="customerId" name="customerId" required>
              <option value="">Select Customer</option>
              {data.customers.map((cust) => (
                <option value={cust.id}>{cust.name}</option>
              ))}
            </select>
          </div>

          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input type="date" id="dueDate" name="dueDate" required />
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" name="notes"></textarea>
          </div>
            
          <div class="form-group">
             <label for="vatRate">VAT Rate (%) (Optional override)</label>
             <input type="number" id="vatRate" name="vatRate" step="0.01" />
          </div>

          <h3 class="mb-4">Line Items</h3>
          <div class="table-container mb-4">
            <table id="lineItemsTable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Rows added via JS */}
              </tbody>
            </table>
          </div>
          <button type="button" id="addLineItemBtn" class="btn btn-outline mb-4">+ Add Line Item</button>

          <div class="mt-4">
            <button type="submit" class="btn btn-primary">Create Invoice</button>
          </div>
        </form>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        const products = ${JSON.stringify(data.products)};
        
        function addRow() {
          const tbody = document.querySelector('#lineItemsTable tbody');
          const tr = document.createElement('tr');
          
          let productOptions = '<option value="">Custom Item</option>';
          products.forEach(p => {
             productOptions += \`<option value="\${p.id}" data-price="\${p.defaultPrice}" data-desc="\${p.description || ''}">\${p.name}</option>\`;
          });

          tr.innerHTML = \`
            <td><select class="product-select" style="width: 100%">\${productOptions}</select></td>
            <td><input type="text" class="desc-input" required></td>
            <td><input type="number" class="qty-input" value="1" min="1" required></td>
            <td><input type="number" class="price-input" step="0.01" required></td>
            <td><button type="button" class="btn btn-danger remove-btn">Remove</button></td>
          \`;
          
          tbody.appendChild(tr);

          const select = tr.querySelector('.product-select');
          const descInput = tr.querySelector('.desc-input');
          const priceInput = tr.querySelector('.price-input');
          
          select.addEventListener('change', (e) => {
             const option = e.target.selectedOptions[0];
             const price = option.getAttribute('data-price');
             const desc = option.getAttribute('data-desc');
             const name = option.text;

             if (e.target.value) {
                priceInput.value = price;
                descInput.value = desc || name; // Use name if desc is null
             } else {
                priceInput.value = '';
                descInput.value = '';
             }
          });
          
          tr.querySelector('.remove-btn').addEventListener('click', () => {
             tr.remove();
          });
        }

        document.getElementById('addLineItemBtn').addEventListener('click', addRow);
        
        // Add one initial row
        addRow();

        document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const lineItems = [];
            document.querySelectorAll('#lineItemsTable tbody tr').forEach(tr => {
                const productId = tr.querySelector('.product-select').value;
                lineItems.push({
                    productId: productId ? Number(productId) : null,
                    description: tr.querySelector('.desc-input').value,
                    quantity: Number(tr.querySelector('.qty-input').value),
                    unitPrice: Number(tr.querySelector('.price-input').value),
                });
            });

            const data = {
                customerId: Number(formData.get('customerId')),
                dueDate: formData.get('dueDate'),
                vatRate: formData.get('vatRate') ? Number(formData.get('vatRate')) : null,
                notes: formData.get('notes') || null,
                lineItems: lineItems
            };

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                window.location.href = '/invoices';
            } else {
                alert('Error creating invoice');
            }
        });
      ` }} />
    </Layout>
  )
})

app.get("/:id", async (c) => {
    const id = Number(c.req.param("id"))
    if (isNaN(id)) return c.text("Invalid ID", 400)
  
    const invoice = await AppRuntime.runPromise(
      Effect.gen(function* () {
        const service = yield* InvoiceService
        return yield* service.get(id)
      })
    )
  
    if (!invoice) return c.text("Invoice not found", 404)
  
    return c.html(
      <Layout title={`Invoice ${invoice.invoiceNumber}`}>
        <div class="flex justify-between items-center mb-4">
          <h1>Invoice {invoice.invoiceNumber}</h1>
          <div class="flex gap-4">
              <a href={`/api/invoices/${id}/pdf`} class="btn btn-primary" target="_blank">Download PDF</a>
              <a href="/invoices" class="btn btn-link">Back to List</a>
          </div>
        </div>
  
        <div class="card">
            <div class="flex justify-between mb-4">
                <div>
                   <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}<br/>
                   <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
                <div class="text-right">
                   <strong>Total:</strong> {invoice.total.toFixed(2)}
                </div>
            </div>
            
            <h3 class="mb-4">Line Items</h3>
            <div class="table-container mb-6">
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.lineItems.map(item => (
                            <tr>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unitPrice.toFixed(2)}</td>
                                <td>{item.lineTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div class="flex justify-end mt-4" style="border-top: 1px solid var(--border-color); padding-top: var(--space-4);">
                <div style="width: 300px;">
                    <div class="flex justify-between mb-1">
                        <span class="text-secondary">Subtotal:</span>
                        <span>{invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-secondary">VAT ({invoice.vatRate}%):</span>
                        <span>{invoice.vatAmount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between font-bold text-lg" style="padding-top: var(--space-2); border-top: 1px solid var(--border-color);">
                         <span>Total:</span>
                         <span class="text-primary">{invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
      </Layout>
    )
  })

export default app
