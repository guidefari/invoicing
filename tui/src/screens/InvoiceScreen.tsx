import { TextAttributes } from "@opentui/core"

export function InvoiceScreen() {
  return (
    <box flexDirection="column">
      <text style={{ fg: "#FF00FF" }} attributes={TextAttributes.BOLD} marginBottom={2}>
        💰 Invoices
      </text>
      <text style={{ fg: "#AAAAAA" }}>Invoice list will be implemented here...</text>
      <box marginTop={2} paddingTop={1} borderColor="#333333">
        <text style={{ fg: "#666666" }}>Press [Esc] to return to main menu</text>
      </box>
    </box>
  )
}
