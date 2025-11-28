import { describe, test, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { InvoiceService, InvoiceServiceLive } from "./InvoiceService.ts"
import { CustomerService, CustomerServiceLive } from "./CustomerService.ts"
import { TestDatabaseLive } from "../db/test-utils.ts"
import type { CreateInvoiceInput, CreateCustomerInput } from "../types/index.ts"

const TestLayer = Layer.mergeAll(
  InvoiceServiceLive,
  CustomerServiceLive
).pipe(Layer.provide(TestDatabaseLive))

const runTest = <A, E>(effect: Effect.Effect<A, E, CustomerService | InvoiceService>) =>
  Effect.runPromise(Effect.provide(effect, TestLayer))

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
})
