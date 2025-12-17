/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import { html } from "hono/html"
import type { FC } from "hono/jsx"

export const Layout: FC<{ title?: string; children: any }> = (props) => {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${props.title ? `${props.title} - Invoicing` : "Invoicing App"}</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body>
        <header>
          <div class="container">
            <div class="flex justify-between items-center">
              <a href="/" class="text-xl font-bold" style="color: inherit;">
                Invoicing
              </a>
              <nav>
                <ul class="flex gap-4 m-0" style="list-style: none; padding: 0;">
                  <li><a href="/" class="font-medium">Dashboard</a></li>
                  <li><a href="/invoices" class="font-medium">Invoices</a></li>
                  <li><a href="/customers" class="font-medium">Customers</a></li>
                  <li><a href="/products" class="font-medium">Products</a></li>
                  <li><a href="/business-info" class="font-medium">Business Info</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <main class="container">
          ${props.children}
        </main>
      </body>
    </html>
  `
}

