/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { Layout } from "./Layout.tsx";
import { Effect } from "effect";
import {
  InvoiceService,
  CustomerService,
  ProductService,
  BankAccountService,
  AppRuntime,
  type InvoiceStatus,
} from "@invoicing/core";

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span class={`badge badge-${status}`}>{label}</span>;
}

const app = new Hono();

app.get("/", async (c) => {
  const invoices = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* InvoiceService;
      return yield* service.list();
    }),
  );

  return c.html(
    <Layout title="Invoices" currentPath="/invoices">
      <div class="page-header">
        <h1>Invoices</h1>
        <a href="/invoices/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Invoice
        </a>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Status</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Currency</th>
              <th class="text-right">Total</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr>
                <td>
                  <a href={`/invoices/${invoice.id}`} class="font-semibold">
                    {invoice.invoiceNumber}
                  </a>
                </td>
                <td><StatusBadge status={(invoice.status ?? "draft") as InvoiceStatus} /></td>
                <td class="text-secondary">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td class="text-secondary">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td><span class="badge">{invoice.currency ?? "ZAR"}</span></td>
                <td class="text-right font-semibold">{invoice.total.toFixed(2)}</td>
                <td class="text-right td-actions">
                  <div class="flex gap-2 justify-end">
                    <a href={`/invoices/${invoice.id}`} class="btn btn-sm btn-outline">View</a>
                    <a href={`/invoices/${invoice.id}/edit`} class="btn btn-sm btn-ghost">Edit</a>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colspan={7}>
                  <div class="empty-state">
                    <p>No invoices yet. Create your first invoice to get started.</p>
                    <a href="/invoices/new" class="btn btn-primary btn-sm">Create Invoice</a>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>,
  );
});

app.get("/new", async (c) => {
  const data = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const customerService = yield* CustomerService;
      const productService = yield* ProductService;
      const bankAccountService = yield* BankAccountService;
      return {
        customers: yield* customerService.list(),
        products: yield* productService.list(),
        bankAccounts: yield* bankAccountService.list(),
      };
    }),
  );

  return c.html(
    <Layout title="New Invoice" currentPath="/invoices">
      <div class="page-header">
        <h1>New Invoice</h1>
        <a href="/invoices" class="btn btn-outline">Back to Invoices</a>
      </div>

      <div class="card">
        <form id="invoiceForm">
          <div class="form-section">
            <div class="form-section-title">Invoice Details</div>
            <div class="form-grid">
              <div class="form-group">
                <label for="customerId">Customer <span class="required">*</span></label>
                <select id="customerId" name="customerId" required>
                  <option value="">Select a customer…</option>
                  {data.customers.map((cust) => (
                    <option value={cust.id}>{cust.name}</option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label for="dueDate">Due Date <span class="required">*</span></label>
                <input type="date" id="dueDate" name="dueDate" required />
              </div>

              <div class="form-group">
                <label for="bankAccountId">Bank Account</label>
                <select id="bankAccountId" name="bankAccountId">
                  <option value="">Use default</option>
                  {data.bankAccounts.map((ba) => (
                    <option value={ba.id}>{ba.label} ({ba.currency}){ba.isDefault ? " ★" : ""}</option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label for="vatRate">VAT Rate Override (%)</label>
                <input type="number" id="vatRate" name="vatRate" step="0.01" min="0" max="100" placeholder="Uses business default" />
              </div>

              <div class="form-group full-width">
                <label for="notes">Notes</label>
                <textarea id="notes" name="notes" placeholder="Any additional notes for this invoice…"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Line Items</div>
            <div class="table-container mb-4" style="box-shadow: none;">
              <table id="lineItemsTable">
                <thead>
                  <tr>
                    <th style="width: 200px;">Product</th>
                    <th>Description</th>
                    <th style="width: 100px;">Qty</th>
                    <th style="width: 130px;">Unit Price</th>
                    <th style="width: 48px;"></th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            <button type="button" id="addLineItemBtn" class="btn btn-outline btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Line Item
            </button>
          </div>

          <div class="flex gap-2 mt-6">
            <button type="submit" class="btn btn-primary">Create Invoice</button>
            <a href="/invoices" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
        const products = ${JSON.stringify(data.products)};

        function addRow() {
          const tbody = document.querySelector('#lineItemsTable tbody');
          const tr = document.createElement('tr');

          let productOptions = '<option value="">Custom item</option>';
          products.forEach(p => {
             productOptions += \`<option value="\${p.id}" data-price="\${p.defaultPrice}" data-desc="\${p.description || ''}">\${p.name}</option>\`;
          });

          tr.innerHTML = \`
            <td><select class="product-select">\${productOptions}</select></td>
            <td><input type="text" class="desc-input" placeholder="Description" required></td>
            <td><input type="number" class="qty-input" value="1" step="any" min="0.01" required></td>
            <td><input type="number" class="price-input" step="0.01" placeholder="0.00" required></td>
            <td style="padding: 0.5rem;">
              <button type="button" class="btn btn-ghost btn-sm remove-btn" aria-label="Remove row" style="padding: 0.375rem; color: var(--danger);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
            </td>
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
                descInput.value = desc || name;
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
        addRow();

        document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating…';

            const formData = new FormData(e.target);

            const lineItems = [];
            document.querySelectorAll('#lineItemsTable tbody tr').forEach(tr => {
                const productId = tr.querySelector('.product-select').value;
                lineItems.push({
                    productId: productId ? Number(productId) : null,
                    description: tr.querySelector('.desc-input').value,
                    quantity: Number.parseFloat(tr.querySelector('.qty-input').value),
                    unitPrice: Number.parseFloat(tr.querySelector('.price-input').value),
                });
            });

            const bankAccountId = formData.get('bankAccountId');
            const data = {
                customerId: Number(formData.get('customerId')),
                bankAccountId: bankAccountId ? Number(bankAccountId) : null,
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
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Invoice';
                alert('Error creating invoice. Please try again.');
            }
        });
      `,
        }}
      />
    </Layout>,
  );
});

app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const invoice = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const service = yield* InvoiceService;
      return yield* service.get(id);
    }),
  );

  if (!invoice) return c.text("Invoice not found", 404);

  const invoiceStatus = (invoice.status ?? "draft") as InvoiceStatus

  return c.html(
    <Layout title={`Invoice ${invoice.invoiceNumber}`} currentPath="/invoices">
      <div class="page-header">
        <div>
          <h1 style="margin-bottom: 0.25rem;">
            Invoice {invoice.invoiceNumber}
            {" "}<StatusBadge status={invoiceStatus} />
          </h1>
          <p style="margin: 0; font-size: 0.875rem;">
            <span class="badge">{invoice.currency ?? "ZAR"}</span>
            {" · "}Issued {new Date(invoice.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
            {" · "}Due {new Date(invoice.dueDate).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
            {invoice.paidAt && ` · Paid ${new Date(invoice.paidAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}`}
          </p>
        </div>
        <div class="flex gap-2">
          <a href={`/invoices/${id}/edit`} class="btn btn-outline">Edit</a>
          <a href={`/api/invoices/${id}/pdf`} class="btn btn-outline" target="_blank" rel="noopener">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </a>
          {invoiceStatus === "paid" && (
            <a href={`/api/invoices/${id}/receipt/pdf`} class="btn btn-primary" target="_blank" rel="noopener">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Download Receipt
            </a>
          )}
          <a href="/invoices" class="btn btn-ghost">Back</a>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <span style="font-size: 0.875rem; font-weight: 600;">Change Status:</span>
          {(["draft", "sent", "paid", "overdue", "cancelled"] as InvoiceStatus[])
            .filter((s) => s !== invoiceStatus)
            .map((s) => (
              <button
                type="button"
                class={`btn btn-sm ${s === "paid" ? "btn-primary" : "btn-outline"}`}
                data-status={s}
                onclick={`updateStatus('${s}')`}
              >
                {s === "paid" ? "Mark as Paid" : s === "sent" ? "Mark as Sent" : s === "overdue" ? "Mark as Overdue" : s === "cancelled" ? "Cancel Invoice" : "Revert to Draft"}
              </button>
            ))}
        </div>
      </div>

      <div class="card">
        <div class="table-container mb-6" style="box-shadow: none; border-color: var(--border-color);">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="width: 80px;">Qty</th>
                <th style="width: 130px;" class="text-right">Unit Price</th>
                <th style="width: 130px;" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr>
                  <td>{item.description}</td>
                  <td class="text-secondary">{item.quantity}</td>
                  <td class="text-right">{item.unitPrice.toFixed(2)}</td>
                  <td class="text-right font-semibold">{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="totals-box">
          <div class="totals-row">
            <span class="text-secondary">Subtotal</span>
            <span>{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span class="text-secondary">VAT ({invoice.vatRate}%)</span>
            <span>{invoice.vatAmount.toFixed(2)}</span>
          </div>
          <div class="totals-row total-final">
            <span>Total</span>
            <span class="amount">{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        async function updateStatus(status) {
          const res = await fetch('/api/invoices/${id}/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          if (res.ok) {
            window.location.reload();
          } else {
            const err = await res.json();
            alert('Error: ' + (err.error || 'Failed to update status'));
          }
        }
      `}} />
    </Layout>,
  );
});

app.get("/:id/edit", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const data = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const invoiceService = yield* InvoiceService;
      const customerService = yield* CustomerService;
      const productService = yield* ProductService;
      const bankAccountService = yield* BankAccountService;

      const invoice = yield* invoiceService.get(id);
      if (!invoice) return undefined;

      return {
        invoice,
        customers: yield* customerService.list(),
        products: yield* productService.list(),
        bankAccounts: yield* bankAccountService.list(),
      };
    }),
  );

  if (!data) return c.text("Invoice not found", 404);

  return c.html(
    <Layout title={`Edit ${data.invoice.invoiceNumber}`} currentPath="/invoices">
      <div class="page-header">
        <h1>Edit {data.invoice.invoiceNumber}</h1>
        <a href={`/invoices/${id}`} class="btn btn-outline">Cancel</a>
      </div>

      <div class="card">
        <form id="invoiceForm">
          <div class="form-section">
            <div class="form-section-title">Invoice Details</div>
            <div class="form-grid">
              <div class="form-group">
                <label for="customerId">Customer <span class="required">*</span></label>
                <select id="customerId" name="customerId" required>
                  <option value="">Select a customer…</option>
                  {data.customers.map((cust) => (
                    <option value={cust.id} selected={cust.id === data.invoice.customerId}>
                      {cust.name}
                    </option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label for="dueDate">Due Date <span class="required">*</span></label>
                <input type="date" id="dueDate" name="dueDate" value={data.invoice.dueDate} required />
              </div>

              <div class="form-group">
                <label for="bankAccountId">Bank Account</label>
                <select id="bankAccountId" name="bankAccountId">
                  <option value="">Use default</option>
                  {data.bankAccounts.map((ba) => (
                    <option value={ba.id} selected={ba.id === data.invoice.bankAccountId}>{ba.label} ({ba.currency}){ba.isDefault ? " ★" : ""}</option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label for="vatRate">VAT Rate Override (%)</label>
                <input type="number" id="vatRate" name="vatRate" value={data.invoice.vatRate ?? ""} step="0.01" min="0" max="100" placeholder="Uses business default" />
              </div>

              <div class="form-group full-width">
                <label for="notes">Notes</label>
                <textarea id="notes" name="notes">{data.invoice.notes}</textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Line Items</div>
            <div class="table-container mb-4" style="box-shadow: none;">
              <table id="lineItemsTable">
                <thead>
                  <tr>
                    <th style="width: 200px;">Product</th>
                    <th>Description</th>
                    <th style="width: 100px;">Qty</th>
                    <th style="width: 130px;">Unit Price</th>
                    <th style="width: 48px;"></th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            <button type="button" id="addLineItemBtn" class="btn btn-outline btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Line Item
            </button>
          </div>

          <div class="flex gap-2 mt-6">
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <a href={`/invoices/${id}`} class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          const products = ${JSON.stringify(data.products)};
          const existingLineItems = ${JSON.stringify(data.invoice.lineItems)};

          function addRow(item = null) {
            const tbody = document.querySelector('#lineItemsTable tbody');
            const tr = document.createElement('tr');

            let productOptions = '<option value="">Custom item</option>';
            products.forEach(p => {
               const selected = (item && item.productId === p.id) ? 'selected' : '';
               productOptions += \`<option value="\${p.id}" data-price="\${p.defaultPrice}" data-desc="\${p.description || ''}" \${selected}>\${p.name}</option>\`;
            });

            tr.innerHTML = \`
              <td><select class="product-select">\${productOptions}</select></td>
              <td><input type="text" class="desc-input" value="\${item ? item.description.replace(/"/g, '&quot;') : ''}" placeholder="Description" required></td>
              <td><input type="number" class="qty-input" value="\${item ? item.quantity : 1}" step="any" min="0.01" required></td>
              <td><input type="number" class="price-input" value="\${item ? item.unitPrice : ''}" step="0.01" placeholder="0.00" required></td>
              <td style="padding: 0.5rem;">
                <button type="button" class="btn btn-ghost btn-sm remove-btn" aria-label="Remove row" style="padding: 0.375rem; color: var(--danger);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </td>
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
                  descInput.value = desc || name;
               } else {
                  priceInput.value = '';
                  descInput.value = '';
               }
            });

            tr.querySelector('.remove-btn').addEventListener('click', () => {
               tr.remove();
            });
          }

          document.getElementById('addLineItemBtn').addEventListener('click', () => addRow());

          if (existingLineItems.length > 0) {
            existingLineItems.forEach(item => addRow(item));
          } else {
            addRow();
          }

          document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const submitBtn = e.target.querySelector('[type="submit"]');
              submitBtn.disabled = true;
              submitBtn.textContent = 'Saving…';

              const formData = new FormData(e.target);

              const lineItems = [];
              document.querySelectorAll('#lineItemsTable tbody tr').forEach(tr => {
                  const productId = tr.querySelector('.product-select').value;
                  lineItems.push({
                      productId: productId ? Number(productId) : null,
                      description: tr.querySelector('.desc-input').value,
                      quantity: Number.parseFloat(tr.querySelector('.qty-input').value),
                      unitPrice: Number.parseFloat(tr.querySelector('.price-input').value),
                  });
              });

              const bankAccountId = formData.get('bankAccountId');
              const data = {
                  customerId: Number(formData.get('customerId')),
                  bankAccountId: bankAccountId ? Number(bankAccountId) : null,
                  dueDate: formData.get('dueDate'),
                  vatRate: formData.get('vatRate') ? Number(formData.get('vatRate')) : null,
                  notes: formData.get('notes') || null,
                  lineItems: lineItems
              };

              const res = await fetch('/api/invoices/${id}', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
              });

              if (res.ok) {
                  window.location.href = '/invoices/${id}';
              } else {
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Save Changes';
                  alert('Error updating invoice. Please try again.');
              }
          });
        `,
        }}
      />
    </Layout>,
  );
});

export default app;
