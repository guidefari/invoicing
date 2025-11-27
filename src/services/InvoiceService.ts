import { Context, Effect, Layer } from "effect"
import { Database, DatabaseError } from "./Database.ts"
import type { Invoice, InvoiceLineItem, CreateInvoiceInput } from "../types/index.ts"

export interface InvoiceWithLineItems extends Invoice {
  lineItems: InvoiceLineItem[]
}

export class InvoiceService extends Context.Tag("InvoiceService")<
  InvoiceService,
  {
    readonly list: () => Effect.Effect<Invoice[], DatabaseError>
    readonly get: (id: number) => Effect.Effect<InvoiceWithLineItems | undefined, DatabaseError>
    readonly create: (input: CreateInvoiceInput) => Effect.Effect<InvoiceWithLineItems, DatabaseError>
    readonly getNextInvoiceNumber: () => Effect.Effect<string, DatabaseError>
  }
>() {}

export const InvoiceServiceLive = Layer.effect(
  InvoiceService,
  Effect.gen(function* () {
    const db = yield* Database

    const getNextInvoiceNumber = () =>
      Effect.gen(function* () {
        const result = yield* db.get<{ maxNum: number | null }>(
          `SELECT MAX(CAST(SUBSTR(invoice_number, 5) AS INTEGER)) as maxNum
           FROM invoices WHERE invoice_number LIKE 'INV-%'`
        )

        const nextNum = (result?.maxNum ?? 0) + 1
        return `INV-${String(nextNum).padStart(3, "0")}`
      })

    return {
      getNextInvoiceNumber,

      list: () =>
        db.query<Invoice>(
          `SELECT id, invoice_number as invoiceNumber, customer_id as customerId,
           created_at as createdAt, due_date as dueDate, vat_rate as vatRate,
           notes, subtotal, vat_amount as vatAmount, total
           FROM invoices ORDER BY created_at DESC`
        ),

      get: (id: number) =>
        Effect.gen(function* () {
          const invoice = yield* db.get<Invoice>(
            `SELECT id, invoice_number as invoiceNumber, customer_id as customerId,
             created_at as createdAt, due_date as dueDate, vat_rate as vatRate,
             notes, subtotal, vat_amount as vatAmount, total
             FROM invoices WHERE id = ?`,
            [id]
          )

          if (!invoice) return undefined

          const lineItems = yield* db.query<InvoiceLineItem>(
            `SELECT id, invoice_id as invoiceId, product_id as productId,
             description, quantity, unit_price as unitPrice, line_total as lineTotal,
             additional_notes as additionalNotes
             FROM invoice_line_items WHERE invoice_id = ?`,
            [id]
          )

          return { ...invoice, lineItems }
        }),

      create: (input: CreateInvoiceInput) =>
        Effect.gen(function* () {
          const invoiceNumber = yield* getNextInvoiceNumber()

          const subtotal = input.lineItems.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
          )
          const vatAmount = subtotal * (input.vatRate / 100)
          const total = subtotal + vatAmount

          yield* db.execute(
            `INSERT INTO invoices (invoice_number, customer_id, due_date, vat_rate, notes, subtotal, vat_amount, total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              invoiceNumber,
              input.customerId,
              input.dueDate,
              input.vatRate,
              input.notes,
              subtotal,
              vatAmount,
              total,
            ]
          )

          const invoice = yield* db.get<Invoice>(
            `SELECT id, invoice_number as invoiceNumber, customer_id as customerId,
             created_at as createdAt, due_date as dueDate, vat_rate as vatRate,
             notes, subtotal, vat_amount as vatAmount, total
             FROM invoices WHERE id = last_insert_rowid()`
          )

          if (!invoice) {
            return yield* Effect.fail(new DatabaseError("Failed to retrieve created invoice"))
          }

          for (const item of input.lineItems) {
            const lineTotal = item.quantity * item.unitPrice
            yield* db.execute(
              `INSERT INTO invoice_line_items (invoice_id, product_id, description, quantity, unit_price, line_total, additional_notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                invoice.id,
                item.productId,
                item.description,
                item.quantity,
                item.unitPrice,
                lineTotal,
                item.additionalNotes,
              ]
            )
          }

          const lineItems = yield* db.query<InvoiceLineItem>(
            `SELECT id, invoice_id as invoiceId, product_id as productId,
             description, quantity, unit_price as unitPrice, line_total as lineTotal,
             additional_notes as additionalNotes
             FROM invoice_line_items WHERE invoice_id = ?`,
            [invoice.id]
          )

          return { ...invoice, lineItems }
        }),
    }
  })
)
