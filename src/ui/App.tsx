import { createSignal, Switch, Match } from "solid-js"
import { useKeyboard, useRenderer } from "@opentui/solid"
import { TextAttributes } from "@opentui/core"
import { CustomerScreen } from "./screens/CustomerScreen.tsx"
import { ProductScreen } from "./screens/ProductScreen.tsx"
import { InvoiceScreen } from "./screens/InvoiceScreen.tsx"
import { SettingsScreen } from "./screens/SettingsScreen.tsx"

type Screen = "main-menu" | "customers" | "products" | "invoices" | "settings"

export function App() {
  const [currentScreen, setCurrentScreen] = createSignal<Screen>("main-menu")
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.raw === "\u0003") {
      renderer.stop()
      process.exit(0)
    }

    if (key.name === "escape") {
      setCurrentScreen("main-menu")
      return
    }

    if (currentScreen() === "main-menu") {
      switch (key.name) {
        case "1":
          setCurrentScreen("customers")
          break
        case "2":
          setCurrentScreen("products")
          break
        case "3":
          setCurrentScreen("invoices")
          break
        case "4":
          setCurrentScreen("settings")
          break
        case "q":
          renderer.stop()
          process.exit(0)
      }
    }
  })

  return (
    <box flexDirection="column" padding={2} height="100%">
      <box
        border={true}
        borderStyle="double"
        padding={1}
        marginBottom={2}
        borderColor="#00AAFF"
      >
        <text style={{ fg: "#00AAFF" }} attributes={TextAttributes.BOLD}>
          ⚡ Invoice Management System
        </text>
      </box>

      <Switch>
        <Match when={currentScreen() === "main-menu"}>
          <MainMenu />
        </Match>
        <Match when={currentScreen() === "customers"}>
          <CustomerScreen />
        </Match>
        <Match when={currentScreen() === "products"}>
          <ProductScreen />
        </Match>
        <Match when={currentScreen() === "invoices"}>
          <InvoiceScreen />
        </Match>
        <Match when={currentScreen() === "settings"}>
          <SettingsScreen />
        </Match>
      </Switch>
    </box>
  )
}

function MainMenu() {
  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.BOLD} style={{ fg: "#FFFF00" }} marginBottom={1}>
        Main Menu
      </text>

      <box flexDirection="column" gap={0.5}>
        <MenuOption number="1" label="Customer Management" description="View and manage customers" />
        <MenuOption number="2" label="Product Catalog" description="Manage your products and services" />
        <MenuOption number="3" label="Invoices" description="Create and view invoices" />
        <MenuOption number="4" label="Settings" description="Business information and preferences" />
      </box>

      <box marginTop={2} paddingTop={1} borderColor="#333333">
        <text style={{ fg: "#666666" }}>
          Press [1-4] to navigate • [q] or Ctrl+C to quit
        </text>
      </box>
    </box>
  )
}

function MenuOption(props: { number: string; label: string; description: string }) {
  return (
    <box flexDirection="row" gap={1}>
      <text attributes={TextAttributes.BOLD} style={{ fg: "#00FF00" }}>
        [{props.number}]
      </text>
      <box flexDirection="column">
        <text style={{ fg: "#FFFFFF" }}>
          {props.label}
        </text>
        <text style={{ fg: "#888888" }}>
          {props.description}
        </text>
      </box>
    </box>
  )
}
