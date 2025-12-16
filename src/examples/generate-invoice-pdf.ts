import { Effect, Layer } from "effect"
import { DatabaseLive } from "../services/Database.ts"
import { InvoiceServiceLive } from "../services/InvoiceService.ts"
import { CustomerServiceLive } from "../services/CustomerService.ts"
import { ProductServiceLive } from "../services/ProductService.ts"
import { BusinessInfoServiceLive } from "../services/BusinessInfoService.ts"
import { PDFServiceLive } from "../services/PDFService.ts"
import { InvoicePDFServiceLive, InvoicePDFService } from "../services/InvoicePDFService.ts"
import { writeFile } from "node:fs/promises"

const MainLayer = InvoicePDFServiceLive.pipe(
  Layer.provideMerge(
    InvoiceServiceLive.pipe(
      Layer.provideMerge(ProductServiceLive),
      Layer.provideMerge(CustomerServiceLive),
      Layer.provideMerge(BusinessInfoServiceLive)
    )
  ),
  Layer.provideMerge(PDFServiceLive),
  Layer.provide(DatabaseLive)
)

const program = Effect.gen(function* () {
  const pdfService = yield* InvoicePDFService

  const invoiceId = 1

  console.log(`Generating PDF for invoice #${invoiceId}...`)

  const pdfBuffer = yield* pdfService.generatePDF(invoiceId)

  const filename = `invoice-${invoiceId}.pdf`
  yield* Effect.tryPromise({
    try: () => writeFile(filename, pdfBuffer),
    catch: (error) => new Error(`Failed to write PDF file: ${error}`),
  })

  console.log(`PDF generated successfully: ${filename}`)
})

const runnable = program.pipe(Effect.provide(MainLayer))

Effect.runPromise(runnable).catch(console.error)
