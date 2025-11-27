import { createSignal, onMount, Show } from "solid-js"
import { Effect } from "effect"
import { TextAttributes } from "@opentui/core"
import type { Customer } from "../../types/index.ts"
import { CustomerService } from "../../services/CustomerService.ts"
import { AppLayer } from "../../runtime.ts"

export function CustomerScreen() {
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  onMount(async () => {
    try {
      const program = Effect.gen(function* () {
        const service = yield* CustomerService
        return yield* service.list()
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      setCustomers(result)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers")
      setLoading(false)
    }
  })

  return (
    <box flexDirection="column" flexGrow={1} height="100%">
      <text style={{ fg: "#00FF00" }} attributes={TextAttributes.BOLD} marginBottom={1}>
        📋 Customer Management
      </text>

      <Show when={loading()}>
        <text style={{ fg: "#AAAAAA" }}>Loading customers...</text>
      </Show>

      <Show when={error()}>
        <text style={{ fg: "#FF0000" }}>Error: {error()}</text>
      </Show>

      <Show when={!loading() && !error()}>
        <Show
          when={customers().length === 0}
          fallback={
            <box
              border={true}
              borderStyle="single"
              borderColor="#00FF00"
              title="Customers"
              flexGrow={1}
              marginBottom={1}
            >
              <select
                focused
                options={customers().map((customer) => ({
                  name: customer.name,
                  description: `${customer.vatNumber} • ${customer.city} • ${customer.email}`,
                  value: customer.id,
                }))}
                style={{
                  height: "100%",
                  backgroundColor: "transparent",
                  focusedBackgroundColor: "transparent",
                  selectedBackgroundColor: "#003300",
                  selectedTextColor: "#00FF00",
                  descriptionColor: "#888888",
                }}
                showScrollIndicator
                wrapSelection
              />
            </box>
          }
        >
          <text style={{ fg: "#888888" }}>No customers found. Press [n] to create one.</text>
        </Show>
      </Show>

      <box paddingTop={1} borderColor="#333333">
        <text style={{ fg: "#666666" }}>
          [↑↓] Navigate • [Enter] Edit • [n] New • [Esc] Back
        </text>
      </box>
    </box>
  )
}
