import { Context, Effect, Layer } from "effect"
import puppeteer from "puppeteer"

export class PDFError {
  readonly _tag = "PDFError"
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export interface GeneratePDFOptions {
  html: string
  format?: "A4" | "Letter"
  printBackground?: boolean
}

export class PDFService extends Context.Tag("PDFService")<
  PDFService,
  {
    readonly generatePDF: (options: GeneratePDFOptions) => Effect.Effect<Buffer, PDFError>
  }
>() {}

export const PDFServiceLive = Layer.succeed(
  PDFService,
  PDFService.of({
    generatePDF: (options: GeneratePDFOptions) =>
      Effect.gen(function* () {
        let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

        try {
          browser = yield* Effect.tryPromise({
            try: () => puppeteer.launch({ headless: true }),
            catch: (error) => new PDFError("Failed to launch browser", error),
          })

          const page = yield* Effect.tryPromise({
            try: () => browser!.newPage(),
            catch: (error) => new PDFError("Failed to create new page", error),
          })

          yield* Effect.tryPromise({
            try: () => page.setContent(options.html, { waitUntil: "networkidle0" }),
            catch: (error) => new PDFError("Failed to set page content", error),
          })

          const pdfBuffer = yield* Effect.tryPromise({
            try: () =>
              page.pdf({
                format: options.format || "A4",
                printBackground: options.printBackground ?? true,
                margin: {
                  top: "20mm",
                  right: "15mm",
                  bottom: "20mm",
                  left: "15mm",
                },
              }),
            catch: (error) => new PDFError("Failed to generate PDF", error),
          })

          return Buffer.from(pdfBuffer)
        } finally {
          if (browser) {
            yield* Effect.tryPromise({
              try: () => browser!.close(),
              catch: () => new PDFError("Failed to close browser"),
            }).pipe(Effect.ignore)
          }
        }
      }),
  })
)
