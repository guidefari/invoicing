import { Layer, ManagedRuntime } from "effect"
import { DatabaseLive } from "./services/Database.ts"
import { CustomerServiceLive } from "./services/CustomerService.ts"
import { ProductServiceLive } from "./services/ProductService.ts"
import { InvoiceServiceLive } from "./services/InvoiceService.ts"
import { BusinessInfoServiceLive } from "./services/BusinessInfoService.ts"
import { PDFServiceLive } from "./services/PDFService.ts"
import { InvoicePDFServiceLive } from "./services/InvoicePDFService.ts"

export const AppLayer = InvoicePDFServiceLive.pipe(
  Layer.provideMerge(
    InvoiceServiceLive.pipe(
      Layer.provideMerge(ProductServiceLive),
      Layer.provideMerge(CustomerServiceLive),
      Layer.provideMerge(BusinessInfoServiceLive)
    )
  ),
  Layer.provideMerge(PDFServiceLive),
  Layer.provideMerge(DatabaseLive)
)

export const AppRuntime = ManagedRuntime.make(AppLayer)
