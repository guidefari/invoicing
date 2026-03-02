import puppeteer from "puppeteer"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { generateInvoiceHTML, generateReceiptHTML } from "../src/templates/invoice-template.ts"
import type { InvoiceTemplateData } from "../src/templates/invoice-template.ts"
import type { BankAccount, BusinessInfo, Customer, Invoice, InvoiceLineItem } from "../src/types/index.ts"

const OUT_DIR = join(import.meta.dir, "fixtures")

const businessInfo: BusinessInfo = {
  id: 1,
  companyName: "Acme Design Studio",
  streetAddress: "42 Innovation Drive",
  city: "Cape Town",
  postalCode: "8001",
  country: "South Africa",
  vatNumber: "4123456789",
  email: "billing@acme.studio",
  phone: "+27 21 555 0100",
  logoPath: null,
  accountHolderName: "Acme Design Studio (Pty) Ltd",
  bankName: "FNB",
  accountNumber: "62000000000",
  branchCode: "250655",
  defaultVatRate: 15,
}

const customer: Customer = {
  id: 1,
  name: "Globex Corporation",
  vatNumber: "DE123456789",
  streetAddress: "100 Industrial Park",
  city: "Berlin",
  postalCode: "10115",
  country: "Germany",
  email: "ap@globex.de",
  phone: "+49 30 555 0200",
  createdAt: "2024-01-01T00:00:00.000Z",
}

const invoice: Invoice = {
  id: 1,
  invoiceNumber: "INV-2024-0042",
  customerId: 1,
  bankAccountId: 1,
  currency: "ZAR",
  createdAt: "2024-06-01T00:00:00.000Z",
  dueDate: "2024-06-30T00:00:00.000Z",
  vatRate: 15,
  notes: "Thank you for your business.",
  subtotal: 45000,
  vatAmount: 6750,
  total: 51750,
  status: "sent",
  paidAt: null,
}

const lineItems: InvoiceLineItem[] = [
  {
    id: 1,
    invoiceId: 1,
    productId: null,
    description: "Brand Identity Design",
    quantity: 1,
    unitPrice: 25000,
    lineTotal: 25000,
    additionalNotes: "Logo, colour palette, typography system",
  },
  {
    id: 2,
    invoiceId: 1,
    productId: null,
    description: "Website UI Design",
    quantity: 3,
    unitPrice: 5000,
    lineTotal: 15000,
    additionalNotes: "Home, About, Contact pages",
  },
  {
    id: 3,
    invoiceId: 1,
    productId: null,
    description: "Design System Documentation",
    quantity: 1,
    unitPrice: 5000,
    lineTotal: 5000,
    additionalNotes: null,
  },
]

const localBankAccount: BankAccount = {
  id: 1,
  label: "ZAR Business Account",
  currency: "ZAR",
  accountHolderName: "Acme Design Studio (Pty) Ltd",
  bankName: "First National Bank",
  accountNumber: "62123456789",
  branchCode: "250655",
  iban: null,
  swiftBic: null,
  bankAddress: null,
  isDefault: true,
  createdAt: "2024-01-01T00:00:00.000Z",
}

const ibanBankAccount: BankAccount = {
  id: 2,
  label: "EUR Business Account",
  currency: "EUR",
  accountHolderName: "Acme Design Studio (Pty) Ltd",
  bankName: "Deutsche Bank AG",
  accountNumber: null,
  branchCode: null,
  iban: "DE89370400440532013000",
  swiftBic: "DEUTDEDB",
  bankAddress: "Taunusanlage 12, 60325 Frankfurt am Main, Germany",
  isDefault: false,
  createdAt: "2024-01-01T00:00:00.000Z",
}

const eurInvoice: Invoice = {
  ...invoice,
  currency: "EUR",
  bankAccountId: 2,
  invoiceNumber: "INV-2024-0043",
  subtotal: 2500,
  vatAmount: 0,
  total: 2500,
  vatRate: null,
  notes: "Payment via IBAN transfer only.",
  status: "overdue",
  paidAt: null,
}

const paidInvoice: Invoice = {
  ...invoice,
  invoiceNumber: "INV-2024-0040",
  status: "paid",
  paidAt: "2024-06-15T10:30:00.000Z",
}

const paidEurInvoice: Invoice = {
  ...eurInvoice,
  invoiceNumber: "INV-2024-0041",
  status: "paid",
  paidAt: "2024-06-18T09:00:00.000Z",
}

type Fixture = { name: string; data: InvoiceTemplateData; template: "invoice" | "receipt" }

const fixtures: Fixture[] = [
  // — Invoice fixtures —
  {
    name: "invoice-local-account-zar",
    template: "invoice",
    data: { invoice, lineItems, customer, businessInfo, bankAccount: localBankAccount },
  },
  {
    name: "invoice-iban-account-eur",
    template: "invoice",
    data: { invoice: eurInvoice, lineItems, customer, businessInfo, bankAccount: ibanBankAccount },
  },
  {
    name: "invoice-no-bank-account-fallback",
    template: "invoice",
    data: { invoice, lineItems, customer, businessInfo, bankAccount: undefined },
  },
  // — Receipt fixtures —
  {
    name: "receipt-zar-with-vat",
    template: "receipt",
    data: { invoice: paidInvoice, lineItems, customer, businessInfo, bankAccount: localBankAccount },
  },
  {
    name: "receipt-eur-no-vat",
    template: "receipt",
    data: { invoice: paidEurInvoice, lineItems, customer, businessInfo, bankAccount: ibanBankAccount },
  },
]

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ??
  "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome"

async function generatePDF(html: string, outPath: string) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    })
    await writeFile(outPath, pdf)
  } finally {
    await browser.close()
  }
}

await mkdir(OUT_DIR, { recursive: true })

for (const fixture of fixtures) {
  const html = fixture.template === "receipt"
    ? generateReceiptHTML(fixture.data)
    : generateInvoiceHTML(fixture.data)
  const htmlPath = join(OUT_DIR, `${fixture.name}.html`)
  const pdfPath = join(OUT_DIR, `${fixture.name}.pdf`)

  await writeFile(htmlPath, html)
  await generatePDF(html, pdfPath)

  console.log(`✓ ${fixture.name}.pdf`)
}

console.log(`\nOutput: ${OUT_DIR}`)
