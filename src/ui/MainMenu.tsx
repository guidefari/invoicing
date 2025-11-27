import { For } from "solid-js"
import { useKeyboard } from "@opentui/solid"

type Screen = "main-menu" | "customers" | "products" | "invoices" | "settings"

interface MainMenuProps {
  onNavigate: (screen: Screen) => void
}

export function MainMenu(props: MainMenuProps) {
  const menuItems = [
    { key: "1", label: "Customer Management", screen: "customers" as const, icon: "👥" },
    { key: "2", label: "Product Catalog", screen: "products" as const, icon: "📦" },
    { key: "3", label: "Create Invoice", screen: "invoices" as const, icon: "📄" },
    { key: "4", label: "Business Settings", screen: "settings" as const, icon: "⚙️" },
  ]

  useKeyboard((key) => {
    const item = menuItems.find((m) => m.key === key.raw)
    if (item) {
      props.onNavigate(item.screen)
    }
  })

  return (
    <box flexDirection="column">
      <text marginBottom={1} >
        Main Menu
      </text>

      <For each={menuItems}>
        {(item) => (
          <box marginBottom={1}>
            <text >
              [{item.key}]
            </text>
            <text> {item.icon} {item.label}</text>
          </box>
        )}
      </For>

      <box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <text >
          Press a number key to navigate • Press 'q' to quit
        </text>
      </box>
    </box>
  )
}
