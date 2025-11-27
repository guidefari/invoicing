import { createSignal, Show, For } from "solid-js"
import { useKeyboard, useRenderer } from "@opentui/solid"

type Screen = "main-menu" | "customers"

export function App() {
  const [currentScreen, setCurrentScreen] = createSignal<Screen>("main-menu")
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "q" && currentScreen() === "main-menu") {
      renderer.stop()
      process.exit(0)
    }
    if (key.name === "escape") {
      setCurrentScreen("main-menu")
    }
    if (key.name === "1" && currentScreen() === "main-menu") {
      setCurrentScreen("customers")
    }
  })

  return (
    <box flexDirection="column" padding={1}>
      <box borderStyle="rounded" padding={1} marginBottom={1}>
        <text >
          Invoice Management System
        </text>
      </box>

      <Show when={currentScreen() === "main-menu"}>
        <box flexDirection="column">
          <text  marginBottom={1} >
            Main Menu
          </text>
          <box marginBottom={1}>
            <text >
              [1]
            </text>
            <text> Customer Management</text>
          </box>
          <box marginBottom={1}>
            <text >
              [q]
            </text>
            <text> Quit</text>
          </box>
        </box>
      </Show>

      <Show when={currentScreen() === "customers"}>
        <box flexDirection="column">
          <text >
            Customer Management
          </text>
          <text marginTop={1}>
            Press Esc to return to main menu
          </text>
        </box>
      </Show>
    </box>
  )
}
