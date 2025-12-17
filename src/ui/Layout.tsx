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
              <a href="/" style="font-size: 1.25rem; font-weight: bold; text-decoration: none; color: inherit;">
                Invoicing App
              </a>
              <nav>
                <ul>
                  <li><a href="/">Dashboard</a></li>
                  <li><a href="/invoices">Invoices</a></li>
                  <li><a href="/customers">Customers</a></li>
                  <li><a href="/products">Products</a></li>
                  <li><a href="/business-info">Business Info</a></li>
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
