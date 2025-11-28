import { Context, Effect, Layer } from "effect"
import { eq, desc, sql, like } from "drizzle-orm"
import { Database, DatabaseError } from "./Database.ts"
import { invoices, invoiceLineItems } from "../db/drizzle-schema.ts"
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
    const database = yield* Database

    const getNextInvoiceNumber = () =>
      Effect.gen(function* () {
        const result = yield* Effect.try({
          try: () =>
            database.db
              .select({
                maxNum: sql<number | null>`MAX(CAST(SUBSTR(${invoices.invoiceNumber}, 5) AS INTEGER))`,
              })
              .from(invoices)
              .where(like(invoices.invoiceNumber, "INV-%"))
              .get(),
          catch: (error) => new DatabaseError("Failed to get next invoice number", error),
        })

        const nextNum = (result?.maxNum ?? 0) + 1
        return `INV-${String(nextNum).padStart(3, "0")}`
      })

    return {
      getNextInvoiceNumber,

      list: () =>
        Effect.try({
          try: () =>
            database.db.select().from(invoices).orderBy(desc(invoices.createdAt)).all() as Invoice[],
          catch: (error) => new DatabaseError("Failed to list invoices", error),
        }),

      get: (id: number) =>
        Effect.gen(function* () {
          const invoice = yield* Effect.try({
            try: () => database.db.select().from(invoices).where(eq(invoices.id, id)).get(),
            catch: (error) => new DatabaseError("Failed to get invoice", error),
          })

          if (!invoice) return undefined

          const lineItemsResult = yield* Effect.try({
            try: () =>
              database.db
                .select()
                .from(invoiceLineItems)
                .where(eq(invoiceLineItems.invoiceId, id))
                .all(),
            catch: (error) => new DatabaseError("Failed to get invoice line items", error),
          })

          return {
            ...invoice,
            lineItems: lineItemsResult as InvoiceLineItem[],
          } as InvoiceWithLineItems
        }),

      create: (input: CreateInvoiceInput) =>
        Effect.gen(function* () {
          const invoiceNumber = yield* getNextInvoiceNumber()

          const subtotal = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
          const vatAmount = input.vatRate ? subtotal * (input.vatRate / 100) : 0
          const total = subtotal + vatAmount

          yield* Effect.try({
            try: () =>
              database.db
                .insert(invoices)
                .values({
                  invoiceNumber,
                  customerId: input.customerId,
                  dueDate: input.dueDate,
                  vatRate: input.vatRate,
                  notes: input.notes,
                  subtotal,
                  vatAmount,
                  total,
                })
                .run(),
            catch: (error) => new DatabaseError("Failed to create invoice", error),
          })

          const lastId = yield* Effect.try({
            try: () => database.sqlite.query("SELECT last_insert_rowid() as id").get() as { id: number },
            catch: (error) => new DatabaseError("Failed to get last insert ID", error),
          })

          const invoice = yield* Effect.try({
            try: () => database.db.select().from(invoices).where(eq(invoices.id, lastId.id)).get(),
            catch: (error) => new DatabaseError("Failed to retrieve created invoice", error),
          })

          if (!invoice) {
            return yield* Effect.fail(new DatabaseError("Failed to retrieve created invoice"))
          }

          for (const item of input.lineItems) {
            const lineTotal = item.quantity * item.unitPrice
            yield* Effect.try({
              try: () =>
                database.db
                  .insert(invoiceLineItems)
                  .values({
                    invoiceId: invoice.id,
                    productId: item.productId,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal,
                    additionalNotes: item.additionalNotes,
                  })
                  .run(),
              catch: (error) => new DatabaseError("Failed to create invoice line item", error),
            })
          }

          const lineItemsResult = yield* Effect.try({
            try: () =>
              database.db
                .select()
                .from(invoiceLineItems)
                .where(eq(invoiceLineItems.invoiceId, invoice.id))
                .all(),
            catch: (error) => new DatabaseError("Failed to get created invoice line items", error),
          })

          return {
            ...invoice,
            lineItems: lineItemsResult as InvoiceLineItem[],
          } as InvoiceWithLineItems
        }),
    }
  })
)
