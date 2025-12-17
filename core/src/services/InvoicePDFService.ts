import { Context, Effect, Layer } from "effect"
import { InvoiceService } from "./InvoiceService.ts"
import { CustomerService } from "./CustomerService.ts"
import { BusinessInfoService } from "./BusinessInfoService.ts"
import { PDFService, PDFError } from "./PDFService.ts"
import { DatabaseError } from "./Database.ts"
import { generateInvoiceHTML } from "../templates/invoice-template.ts"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export class InvoicePDFError {
  readonly _tag = "InvoicePDFError"
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class InvoicePDFService extends Context.Tag("InvoicePDFService")<
  InvoicePDFService,
  {
    readonly generatePDF: (
      invoiceId: number
    ) => Effect.Effect<Buffer, InvoicePDFError | DatabaseError | PDFError>
  }
>() {}

export const InvoicePDFServiceLive = Layer.effect(
  InvoicePDFService,
  Effect.gen(function* () {
    const invoiceService = yield* InvoiceService
    const customerService = yield* CustomerService
    const businessInfoService = yield* BusinessInfoService
    const pdfService = yield* PDFService

    return {
      generatePDF: (invoiceId: number) =>
        Effect.gen(function* () {
          const invoiceWithLineItems = yield* invoiceService.get(invoiceId)
          if (!invoiceWithLineItems) {
            return yield* Effect.fail(
              new InvoicePDFError(`Invoice with id ${invoiceId} not found`)
            )
          }

          const customer = yield* customerService.get(invoiceWithLineItems.customerId)
          if (!customer) {
            return yield* Effect.fail(
              new InvoicePDFError(`Customer with id ${invoiceWithLineItems.customerId} not found`)
            )
          }

          const businessInfo = yield* businessInfoService.get()
          if (!businessInfo) {
            return yield* Effect.fail(
              new InvoicePDFError("Business info not configured")
            )
          }

          let logoDataUrl: string | undefined

          if (businessInfo.logoPath) {
            const logoPath = join(process.cwd(), businessInfo.logoPath)
            const logoBuffer = yield* Effect.tryPromise({
              try: () => readFile(logoPath),
              catch: () => new InvoicePDFError(`Failed to read logo file: ${businessInfo.logoPath}`),
            }).pipe(Effect.orElseSucceed(() => undefined))

            if (logoBuffer) {
              const ext = businessInfo.logoPath.split(".").pop()?.toLowerCase()
              const mimeType = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : "image/jpeg"
              logoDataUrl = `data:${mimeType};base64,${logoBuffer.toString("base64")}`
            }
          }

          const html = generateInvoiceHTML({
            invoice: invoiceWithLineItems,
            lineItems: invoiceWithLineItems.lineItems,
            customer,
            businessInfo,
            logoDataUrl,
          })

          const pdfBuffer = yield* pdfService.generatePDF({
            html,
            format: "A4",
            printBackground: true,
          })

          return pdfBuffer
        }),
    }
  })
)
