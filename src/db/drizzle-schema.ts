import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core"

export const businessInfo = sqliteTable("business_info", {
  id: integer("id").primaryKey().$default(() => 1),
  companyName: text("company_name").notNull(),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  vatNumber: text("vat_number").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  logoPath: text("logo_path"),
  accountHolderName: text("account_holder_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  branchCode: text("branch_code").notNull(),
  iban: text("iban"),
})

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  vatNumber: text("vat_number"),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  defaultPrice: real("default_price").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const invoices = sqliteTable(
  "invoices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    dueDate: text("due_date").notNull(),
    vatRate: real("vat_rate"),
    notes: text("notes"),
    subtotal: real("subtotal").notNull(),
    vatAmount: real("vat_amount").notNull(),
    total: real("total").notNull(),
  },
  (table) => ({
    customerIdx: index("idx_invoices_customer").on(table.customerId),
  })
)

export const invoiceLineItems = sqliteTable(
  "invoice_line_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    invoiceId: integer("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id),
    description: text("description").notNull(),
    quantity: real("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
    lineTotal: real("line_total").notNull(),
    additionalNotes: text("additional_notes"),
  },
  (table) => ({
    invoiceIdx: index("idx_line_items_invoice").on(table.invoiceId),
  })
)
