import { TextAttributes } from "@opentui/core"

export function SettingsScreen() {
  return (
    <box flexDirection="column">
      <text style={{ fg: "#00AAFF" }} attributes={TextAttributes.BOLD} marginBottom={2}>
        ⚙️ Settings
      </text>
      <text style={{ fg: "#AAAAAA" }}>Business information settings will be implemented here...</text>
      <box marginTop={2} paddingTop={1} borderColor="#333333">
        <text style={{ fg: "#666666" }}>Press [Esc] to return to main menu</text>
      </box>
    </box>
  )
}
