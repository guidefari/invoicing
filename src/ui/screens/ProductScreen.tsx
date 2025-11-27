import { TextAttributes } from "@opentui/core"

export function ProductScreen() {
  return (
    <box flexDirection="column">
      <text style={{ fg: "#FFAA00" }} attributes={TextAttributes.BOLD} marginBottom={2}>
        📦 Product Catalog
      </text>
      <text style={{ fg: "#AAAAAA" }}>Product list will be implemented here...</text>
      <box marginTop={2} paddingTop={1} borderColor="#333333">
        <text style={{ fg: "#666666" }}>Press [Esc] to return to main menu</text>
      </box>
    </box>
  )
}
