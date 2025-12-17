import type { Invoice, InvoiceLineItem, Customer, BusinessInfo } from "../types/index.ts"

export interface InvoiceTemplateData {
  invoice: Invoice
  lineItems: InvoiceLineItem[]
  customer: Customer
  businessInfo: BusinessInfo
  logoDataUrl?: string | undefined
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const generateInvoiceHTML = (data: InvoiceTemplateData): string => {
  const { invoice, lineItems, customer, businessInfo } = data

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #333; }
    .container { max-width: 800px; margin: 0 auto; }

    .header { display: flex; align-items: center; background: linear-gradient(to right, #1e4d5f 0%, #1e4d5f 65%, #4a7c8f 65%, #4a7c8f 100%); padding: 50px 60px; margin-bottom: 40px; }
    .header-left { flex: 1; }
    .header-left h1 { color: white; font-size: 36px; font-weight: 300; letter-spacing: 3px; margin: 0; }
    .header-right { text-align: right; color: white; }
    .header-right .label { font-size: 14px; margin-bottom: 10px; opacity: 0.95; font-weight: 400; }
    .header-right .amount { font-size: 20px; font-weight: 600; line-height: 1.1; }

    .content { padding: 0 50px; }
    .info-section { display: flex; margin-bottom: 40px; }
    .bill-to { flex: 1; }
    .invoice-details { text-align: right; }
    .section-label { font-size: 11px; font-weight: 600; color: #666; margin-bottom: 12px; letter-spacing: 0.5px; }
    .bill-to-name { font-weight: 600; margin-bottom: 4px; }
    .detail-line { margin-bottom: 2px; font-size: 14px; color: #333; }
    .detail-label { display: inline-block; width: 140px; font-weight: 600; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead th { text-align: left; padding: 12px 0; border-bottom: 1px solid #ddd; font-size: 12px; font-weight: 600; color: #666; letter-spacing: 0.5px; }
    thead th.right { text-align: right; }
    tbody td { padding: 16px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    tbody td.right { text-align: right; }
    .item-description { font-weight: 500; }
    .item-notes { font-size: 12px; color: #666; margin-top: 4px; }

    .totals { text-align: right; margin-bottom: 60px; }
    .total-line { padding: 8px 0; }
    .total-line.final { border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
    .total-label { display: inline-block; width: 180px; font-weight: 600; }
    .total-amount { display: inline-block; width: 120px; text-align: right; }
    .total-line.final .total-label { font-size: 14px; font-weight: 700; }
    .total-line.final .total-amount { font-size: 18px; font-weight: 700; }

    .footer { border-top: 1px solid #e0e0e0; padding: 30px 50px; margin-top: 60px; }
    .footer-content { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .footer-left, .footer-right { font-size: 12px; line-height: 1.6; }
    .footer-left .name { font-weight: 600; margin-bottom: 4px; }
    .footer-right { text-align: right; }
    .footer-right .label { font-weight: 600; margin-bottom: 4px; }
    .footer-bank { margin-top: 20px; font-size: 11px; color: #666; }
    .bank-details { display: inline-block; margin-right: 30px; }
    .bank-details .label { font-weight: 600; display: block; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>INVOICE</h1>
      </div>
      <div class="header-right">
        <div class="label">Amount Due (ZAR)</div>
        <div class="amount">${formatCurrency(invoice.total)}</div>
      </div>
    </div>

    <div class="content">
      <!-- Info Section -->
      <div class="info-section">
        <div class="bill-to">
          <div class="section-label">BILL TO</div>
          <div class="bill-to-name">${customer.name}</div>
          ${customer.vatNumber ? `<div class="detail-line" style="font-weight: 600;">VAT: ${customer.vatNumber}</div>` : ""}
          <div class="detail-line">${customer.streetAddress}</div>
          <div class="detail-line">${customer.city}</div>
          <div class="detail-line">${customer.postalCode}, ${customer.country}</div>
          <div class="detail-line" style="margin-top: 12px;">${customer.phone}</div>
          <div class="detail-line">${customer.email}</div>
        </div>
        <div class="invoice-details">
          <div class="detail-line"><span class="detail-label">Invoice Number:</span> ${invoice.invoiceNumber}</div>
          <div class="detail-line"><span class="detail-label">Invoice Date:</span> ${formatDate(invoice.createdAt)}</div>
          <div class="detail-line"><span class="detail-label">Payment Due:</span> ${formatDate(invoice.dueDate)}</div>
          <div class="detail-line"><span class="detail-label">Amount Due (ZAR):</span> ${formatCurrency(invoice.total)}</div>
        </div>
      </div>

      <!-- Line Items Table -->
      <table>
        <thead>
          <tr>
            <th>ITEMS</th>
            <th class="right">QUANTITY</th>
            <th class="right">PRICE</th>
            <th class="right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems
            .map(
              (item) => `
            <tr>
              <td>
                <div class="item-description">${item.description}</div>
                ${item.additionalNotes ? `<div class="item-notes">${item.additionalNotes}</div>` : ""}
              </td>
              <td class="right">${item.quantity}</td>
              <td class="right">${formatCurrency(item.unitPrice)}</td>
              <td class="right">${formatCurrency(item.lineTotal)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="total-line">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${
          invoice.vatAmount > 0
            ? `
        <div class="total-line">
          <span class="total-label">VAT (${invoice.vatRate}%):</span>
          <span class="total-amount">${formatCurrency(invoice.vatAmount)}</span>
        </div>`
            : ""
        }
        <div class="total-line final">
          <span class="total-label">Amount Due (ZAR):</span>
          <span class="total-amount">${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <div class="name">${businessInfo.companyName}</div>
          <div style="margin-bottom: 8px; font-weight: 600;">VAT: ${businessInfo.vatNumber}</div>
          <div>${businessInfo.streetAddress}</div>
          <div>${businessInfo.city}</div>
          <div>${businessInfo.postalCode}</div>
          <div>${businessInfo.country}</div>
        </div>
        <div class="footer-right">
          <div class="label">Contact Information</div>
          <div>${businessInfo.email}</div>
          <div>${businessInfo.phone}</div>
        </div>
      </div>
      <div class="footer-bank">
        <span class="bank-details">
          <span class="label">Bank:</span> ${businessInfo.bankName}
        </span>
        <span class="bank-details">
          <span class="label">Account:</span> ${businessInfo.accountNumber}
        </span>
        <span class="bank-details">
          <span class="label">Branch Code:</span> ${businessInfo.branchCode}
        </span>
      </div>
    </div>
  </div>
</body>
</html>`
}
