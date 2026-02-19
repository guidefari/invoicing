/** @jsx jsx */
/** @jsxImportSource hono/jsx */
import type { FC, Child } from "hono/jsx"

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    href: "/products",
    label: "Products",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  },
  {
    href: "/business-info",
    label: "Business",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>`,
  },
]

export const Layout: FC<{ title?: string; children: Child; currentPath?: string }> = (props) => {
  const currentPath = props.currentPath ?? "/"

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title ? `${props.title} — Invoicing` : "Invoicing"}</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body>
        <div class="app-shell">
          {/* ── Sidebar ── */}
          <aside class="sidebar" id="sidebar" aria-label="Sidebar navigation">
            <div class="sidebar-header">
              <a href="/" class="site-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Invoicing
              </a>
            </div>

            <nav aria-label="Main navigation">
              <ul class="nav-list">
                {navItems.map(({ href, label, icon }) => {
                  const isActive = href === "/" ? currentPath === "/" : currentPath.startsWith(href)
                  return (
                    <li>
                      <a
                        href={href}
                        class={`nav-link${isActive ? " active" : ""}`}
                        dangerouslySetInnerHTML={{ __html: `${icon}<span>${label}</span>` }}
                      />
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* ── Overlay (mobile) ── */}
          <div class="sidebar-overlay" id="sidebarOverlay" aria-hidden="true" />

          {/* ── Main content ── */}
          <div class="content-wrapper">
            {/* Mobile topbar */}
            <div class="topbar">
              <button
                class="menu-btn"
                id="menuBtn"
                aria-label="Open navigation"
                aria-controls="sidebar"
                aria-expanded="false"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <a href="/" class="site-logo topbar-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Invoicing
              </a>
            </div>

            <main>
              {props.children}
            </main>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          const sidebar = document.getElementById('sidebar');
          const overlay = document.getElementById('sidebarOverlay');
          const menuBtn = document.getElementById('menuBtn');

          function openSidebar() {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
            menuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
          }

          function closeSidebar() {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }

          menuBtn.addEventListener('click', () => {
            sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
          });

          overlay.addEventListener('click', closeSidebar);

          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
          });
        ` }} />
      </body>
    </html>
  )
}
