import { describe, test, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { InvoiceService, InvoiceServiceLive } from "./InvoiceService.ts"
import { BusinessInfoService, BusinessInfoServiceLive } from "./BusinessInfoService.ts"
import { CustomerService, CustomerServiceLive } from "./CustomerService.ts"
import { ProductService, ProductServiceLive } from "./ProductService.ts"
import { TestDatabaseLive } from "../db/test-utils.ts"
import type { CreateInvoiceInput, CreateCustomerInput } from "../types/index.ts"

const TestLayer = InvoiceServiceLive.pipe(
  Layer.provideMerge(ProductServiceLive),
  Layer.provideMerge(CustomerServiceLive),
  Layer.provideMerge(BusinessInfoServiceLive),
  Layer.provide(TestDatabaseLive)
)

const runTest = <A, E>(
  effect: Effect.Effect<A, E, CustomerService | InvoiceService | ProductService | BusinessInfoService>
) => Effect.runPromise(Effect.provide(effect, TestLayer))

describe("InvoiceService", () => {
  test("should generate sequential invoice numbers", async () => {
    const numbers = await runTest(
      Effect.gen(function* () {
        const service = yield* InvoiceService
        const num1 = yield* service.getNextInvoiceNumber()
        const num2 = yield* service.getNextInvoiceNumber()
        const num3 = yield* service.getNextInvoiceNumber()
        return [num1, num2, num3]
      })
    )

    expect(numbers[0]).toBe("INV-001")
    expect(numbers[1]).toBe("INV-001")
    expect(numbers[2]).toBe("INV-001")
  })

  test("should create an invoice with line items", async () => {
    const customerInput: CreateCustomerInput = {
      name: "Test Customer",
      vatNumber: "VAT123",
      streetAddress: "123 Test St",
      city: "Test City",
      postalCode: "1234",
      country: "South Africa",
      email: "test@example.com",
      phone: "+27 11 123 4567",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const customerService = yield* CustomerService
        const invoiceService = yield* InvoiceService

        const customer = yield* customerService.create(customerInput)

        const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0] ?? ""

        const invoiceInput: CreateInvoiceInput = {
          customerId: customer.id,
          dueDate,
          vatRate: 15,
          notes: "Payment due within 3 days",
          lineItems: [
            {
              productId: null,
              description: "Web Development",
              quantity: 40,
              unitPrice: 500,
              additionalNotes: "Frontend work",
            },
            {
              productId: null,
              description: "Design Services",
              quantity: 10,
              unitPrice: 750,
              additionalNotes: null,
            },
          ],
        }

        return yield* invoiceService.create(invoiceInput)
      })
    )

    expect(result.invoiceNumber).toBe("INV-001")
    expect(result.lineItems).toHaveLength(2)
    expect(result.subtotal).toBe(27500)
    expect(result.vatAmount).toBe(4125)
    expect(result.total).toBe(31625)
  })

  test("should calculate totals correctly", async () => {
    const customerInput: CreateCustomerInput = {
      name: "Math Test Customer",
      vatNumber: "VAT999",
      streetAddress: "999 Math St",
      city: "Calc City",
      postalCode: "9999",
      country: "South Africa",
      email: "math@test.com",
      phone: "+27 99 999 9999",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const customerService = yield* CustomerService
        const invoiceService = yield* InvoiceService

        const customer = yield* customerService.create(customerInput)

        const invoiceInput: CreateInvoiceInput = {
          customerId: customer.id,
          dueDate: "2025-12-31",
          vatRate: 14,
          notes: null,
          lineItems: [
            {
              productId: null,
              description: "Item 1",
              quantity: 2,
              unitPrice: 1000,
              additionalNotes: null,
            },
            {
              productId: null,
              description: "Item 2",
              quantity: 1,
              unitPrice: 500,
              additionalNotes: null,
            },
          ],
        }

        return yield* invoiceService.create(invoiceInput)
      })
    )

    expect(result.subtotal).toBe(2500)
    expect(result.vatAmount).toBeCloseTo(350, 2)
    expect(result.total).toBeCloseTo(2850, 2)
  })

  test("should list all invoices", async () => {
    const customerInput: CreateCustomerInput = {
      name: "List Test Customer",
      vatNumber: "VATLIST",
      streetAddress: "List St",
      city: "List City",
      postalCode: "0000",
      country: "South Africa",
      email: "list@test.com",
      phone: "+27 00 000 0000",
    }

    const invoices = await runTest(
      Effect.gen(function* () {
        const customerService = yield* CustomerService
        const invoiceService = yield* InvoiceService

        const customer = yield* customerService.create(customerInput)

        yield* invoiceService.create({
          customerId: customer.id,
          dueDate: "2025-12-31",
          vatRate: 15,
          notes: null,
          lineItems: [
            {
              productId: null,
              description: "Service",
              quantity: 1,
              unitPrice: 1000,
              additionalNotes: null,
            },
          ],
        })

        yield* invoiceService.create({
          customerId: customer.id,
          dueDate: "2025-12-31",
          vatRate: 15,
          notes: null,
          lineItems: [
            {
              productId: null,
              description: "Another Service",
              quantity: 1,
              unitPrice: 2000,
              additionalNotes: null,
            },
          ],
        })

        return yield* invoiceService.list()
      })
    )

    expect(invoices).toHaveLength(2)
    const invoiceNumbers = invoices.map((inv) => inv.invoiceNumber).sort()
    expect(invoiceNumbers).toEqual(["INV-001", "INV-002"])
  })

  test("should get invoice with line items", async () => {
    const customerInput: CreateCustomerInput = {
      name: "Get Test Customer",
      vatNumber: "VATGET",
      streetAddress: "Get St",
      city: "Get City",
      postalCode: "1111",
      country: "South Africa",
      email: "get@test.com",
      phone: "+27 11 111 1111",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const customerService = yield* CustomerService
        const invoiceService = yield* InvoiceService

        const customer = yield* customerService.create(customerInput)

        const created = yield* invoiceService.create({
          customerId: customer.id,
          dueDate: "2025-12-31",
          vatRate: 15,
          notes: "Test notes",
          lineItems: [
            {
              productId: null,
              description: "Line Item 1",
              quantity: 2,
              unitPrice: 500,
              additionalNotes: "Notes 1",
            },
            {
              productId: null,
              description: "Line Item 2",
              quantity: 1,
              unitPrice: 1000,
              additionalNotes: null,
            },
          ],
        })

        return yield* invoiceService.get(created.id)
      })
    )

    expect(result).toBeDefined()
    expect(result?.lineItems).toHaveLength(2)
    expect(result?.lineItems[0]?.description).toBe("Line Item 1")
    expect(result?.lineItems[0]?.lineTotal).toBe(1000)
    expect(result?.lineItems[1]?.description).toBe("Line Item 2")
    expect(result?.lineItems[1]?.lineTotal).toBe(1000)
  })

  test("should auto-fill description and price from product", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const customerService = yield* CustomerService
        const productService = yield* ProductService
        const invoiceService = yield* InvoiceService

        const customer = yield* customerService.create({
          name: "Product Test Customer",
          vatNumber: "VATPROD",
          streetAddress: "Product St",
          city: "Product City",
          postalCode: "2222",
          country: "South Africa",
          email: "product@test.com",
          phone: "+27 22 222 2222",
        })

        const product = yield* productService.create({
          name: "Web Development",
          description: "Professional web development services",
          defaultPrice: 1500,
        })

        const invoice = yield* invoiceService.create({
          customerId: customer.id,
          dueDate: "2025-12-31",
          vatRate: null,
          notes: null,
          lineItems: [
            {
              productId: product.id,
              quantity: 10,
            },
            {
              productId: null,
              description: "Discount",
              quantity: 1,
              unitPrice: -500,
            },
          ],
        })

        return invoice
      })
    )

    expect(result.lineItems).toHaveLength(2)
    expect(result.lineItems[0]?.description).toBe("Web Development")
    expect(result.lineItems[0]?.unitPrice).toBe(1500)
    expect(result.lineItems[0]?.lineTotal).toBe(15000)
    expect(result.lineItems[1]?.description).toBe("Discount")
    expect(result.lineItems[1]?.unitPrice).toBe(-500)
    expect(result.subtotal).toBe(14500)
    expect(result.total).toBe(14500)
  })

  test("should use default VAT rate from business info", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const customerService = yield* CustomerService
        const businessInfoService = yield* BusinessInfoService
        const invoiceService = yield* InvoiceService

        // Setup Business Info with default VAT
        yield* businessInfoService.createOrUpdate({
          companyName: "VAT Test Corp",
          streetAddress: "VAT St",
          city: "VAT City",
          postalCode: "3333",
          country: "South Africa",
          vatNumber: "VAT123456",
          email: "vat@test.com",
          phone: "1234567890",
          accountHolderName: "Holder",
          bankName: "Bank",
          accountNumber: "123",
          branchCode: "456",
          defaultVatRate: 15,
        })

        const customer = yield* customerService.create({
          name: "Default VAT Customer",
          vatNumber: "VATCUST",
          streetAddress: "Cust St",
          city: "Cust City",
          postalCode: "4444",
          country: "South Africa",
          email: "cust@test.com",
          phone: "0987654321",
        })

        return yield* invoiceService.create({
          customerId: customer.id,
          dueDate: "2025-12-31",
          vatRate: null, // Should use default
          notes: null,
          lineItems: [
            {
              productId: null,
              description: "Taxable Item",
              quantity: 1,
              unitPrice: 1000,
            },
          ],
        })
      })
    )

    expect(result.subtotal).toBe(1000)
    expect(result.vatRate).toBe(15)
    expect(result.vatAmount).toBe(150)
    expect(result.total).toBe(1150)
  })
})
