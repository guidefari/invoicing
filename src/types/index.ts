export interface BusinessInfo {
  id: number
  companyName: string
  streetAddress: string
  city: string
  postalCode: string
  country: string
  vatNumber: string
  email: string
  phone: string
  logoPath: string | null
}

export interface Customer {
  id: number
  name: string
  vatNumber: string | null
  streetAddress: string
  city: string
  postalCode: string
  country: string
  email: string
  phone: string
  createdAt: string
}

export interface Product {
  id: number
  name: string
  description: string | null
  defaultPrice: number
  createdAt: string
}

export interface Invoice {
  id: number
  invoiceNumber: string
  customerId: number
  createdAt: string
  dueDate: string
  vatRate: number | null
  notes: string | null
  subtotal: number
  vatAmount: number
  total: number
}

export interface InvoiceLineItem {
  id: number
  invoiceId: number
  productId: number | null
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  additionalNotes: string | null
}

export interface BankDetails {
  accountHolderName: string
  bankName: string
  accountNumber: string
  branchCode: string
  iban: string | null
}

export interface CreateCustomerInput {
  name: string
  vatNumber: string | null
  streetAddress: string
  city: string
  postalCode: string
  country: string
  email: string
  phone: string
}

export interface CreateProductInput {
  name: string
  description: string | null
  defaultPrice: number
}

export interface CreateInvoiceInput {
  customerId: number
  dueDate: string
  vatRate: number | null
  notes: string | null
  lineItems: CreateLineItemInput[]
}

export interface CreateLineItemInput {
  productId: number | null
  description: string
  quantity: number
  unitPrice: number
  additionalNotes: string | null
}
