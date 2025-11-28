import type { Invoice, InvoiceLineItem, Customer, BusinessInfo } from "../types/index.ts"

export interface InvoiceTemplateData {
  invoice: Invoice
  lineItems: InvoiceLineItem[]
  customer: Customer
  businessInfo: BusinessInfo
  logoDataUrl?: string
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white p-8">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-start mb-12">
      <div>
        ${data.logoDataUrl ? `<img src="${data.logoDataUrl}" alt="${businessInfo.companyName}" class="h-16 mb-4" />` : ""}
        <h1 class="text-4xl font-bold text-gray-900 mb-2">${businessInfo.companyName}</h1>
        <div class="text-sm text-gray-600">
          <p>${businessInfo.streetAddress}</p>
          <p>${businessInfo.city}, ${businessInfo.postalCode}</p>
          <p>${businessInfo.country}</p>
          <p class="mt-2">VAT: ${businessInfo.vatNumber}</p>
          <p>${businessInfo.email}</p>
          <p>${businessInfo.phone}</p>
        </div>
      </div>
      <div class="text-right">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">INVOICE</h2>
        <div class="text-sm">
          <p class="font-semibold">${invoice.invoiceNumber}</p>
          <p class="text-gray-600 mt-1">Date: ${formatDate(invoice.createdAt)}</p>
          <p class="text-gray-600">Due: ${formatDate(invoice.dueDate)}</p>
        </div>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="mb-12 bg-gray-50 p-6 rounded-lg">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">BILL TO</h3>
      <div class="text-sm">
        <p class="font-semibold text-gray-900">${customer.name}</p>
        <p class="text-gray-600 mt-1">${customer.streetAddress}</p>
        <p class="text-gray-600">${customer.city}, ${customer.postalCode}</p>
        <p class="text-gray-600">${customer.country}</p>
        ${customer.vatNumber ? `<p class="text-gray-600 mt-2">VAT: ${customer.vatNumber}</p>` : ""}
        <p class="text-gray-600 mt-2">${customer.email}</p>
      </div>
    </div>

    <!-- Line Items Table -->
    <div class="mb-8">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-gray-900">
            <th class="text-left py-3 text-sm font-semibold text-gray-700">DESCRIPTION</th>
            <th class="text-right py-3 text-sm font-semibold text-gray-700">QTY</th>
            <th class="text-right py-3 text-sm font-semibold text-gray-700">UNIT PRICE</th>
            <th class="text-right py-3 text-sm font-semibold text-gray-700">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems
            .map(
              (item) => `
            <tr class="border-b border-gray-200">
              <td class="py-4">
                <div class="text-sm font-medium text-gray-900">${item.description}</div>
                ${item.additionalNotes ? `<div class="text-xs text-gray-500 mt-1">${item.additionalNotes}</div>` : ""}
              </td>
              <td class="text-right text-sm text-gray-900">${item.quantity}</td>
              <td class="text-right text-sm text-gray-900">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right text-sm font-medium text-gray-900">${formatCurrency(item.lineTotal)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="flex justify-end mb-12">
      <div class="w-80">
        <div class="flex justify-between py-2 text-sm">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium text-gray-900">${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${
          invoice.vatRate
            ? `
        <div class="flex justify-between py-2 text-sm">
          <span class="text-gray-600">VAT (${invoice.vatRate}%)</span>
          <span class="font-medium text-gray-900">${formatCurrency(invoice.vatAmount)}</span>
        </div>
        `
            : ""
        }
        <div class="flex justify-between py-3 border-t-2 border-gray-900">
          <span class="font-bold text-gray-900">TOTAL</span>
          <span class="font-bold text-xl text-gray-900">${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    <!-- Bank Details -->
    <div class="mb-8 bg-gray-50 p-6 rounded-lg">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">PAYMENT DETAILS</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-600">Account Holder</p>
          <p class="font-medium text-gray-900">${businessInfo.accountHolderName}</p>
        </div>
        <div>
          <p class="text-gray-600">Bank</p>
          <p class="font-medium text-gray-900">${businessInfo.bankName}</p>
        </div>
        <div>
          <p class="text-gray-600">Account Number</p>
          <p class="font-medium text-gray-900">${businessInfo.accountNumber}</p>
        </div>
        <div>
          <p class="text-gray-600">Branch Code</p>
          <p class="font-medium text-gray-900">${businessInfo.branchCode}</p>
        </div>
        ${
          businessInfo.iban
            ? `
        <div class="col-span-2">
          <p class="text-gray-600">IBAN</p>
          <p class="font-medium text-gray-900">${businessInfo.iban}</p>
        </div>
        `
            : ""
        }
      </div>
    </div>

    <!-- Notes -->
    ${
      invoice.notes
        ? `
    <div class="border-t border-gray-200 pt-6">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">NOTES</h3>
      <p class="text-sm text-gray-600">${invoice.notes}</p>
    </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>`
}
