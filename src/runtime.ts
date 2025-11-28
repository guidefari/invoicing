import { Layer } from "effect"
import { DatabaseLive } from "./services/Database.ts"
import { CustomerServiceLive } from "./services/CustomerService.ts"
import { ProductServiceLive } from "./services/ProductService.ts"
import { InvoiceServiceLive } from "./services/InvoiceService.ts"

export const AppLayer = InvoiceServiceLive.pipe(
  Layer.provideMerge(ProductServiceLive),
  Layer.provideMerge(CustomerServiceLive),
  Layer.provideMerge(DatabaseLive)
)
