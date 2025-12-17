import { createSignal, createEffect, For, Show } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import { Effect } from "effect"
import { CustomerService, AppLayer, type Customer } from "@invoicing/core"

export function CustomerList() {
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  createEffect(() => {
    const program = Effect.gen(function* () {
      const service = yield* CustomerService
      return yield* service.list()
    }).pipe(Effect.provide(AppLayer))

    Effect.runPromise(program)
      .then((data) => {
        setCustomers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Failed to load customers")
        setLoading(false)
      })
  })

  useKeyboard((key) => {
    if (key.raw === "n") {
      // TODO: Navigate to create customer form
    }
  })

  return (
    <box flexDirection="column">
      <box marginBottom={1}>
        <text >
          Customer Management
        </text>
      </box>

      <Show when={loading()}>
        <text >Loading customers...</text>
      </Show>

      <Show when={error()}>
        <text>Error: {error()}</text>
      </Show>

      <Show when={!loading() && !error()}>
        <Show
          when={customers().length > 0}
          fallback={
            <box flexDirection="column">
              <text >No customers found.</text>
              <text  marginTop={1}>Press 'n' to create a new customer</text>
            </box>
          }
        >
          <box flexDirection="column" marginBottom={1}>
            <For each={customers()}>
              {(customer, index) => (
                <box
                  borderStyle="single"
                  borderColor="gray"
                  padding={1}
                  marginBottom={1}
                >
                  <box flexDirection="column">
                    <box>
                      <text >
                        [{index() + 1}]
                      </text>
                      <text > {customer.name}</text>
                    </box>
                    <text >VAT: {customer.vatNumber}</text>
                    <text >
                      {customer.city}, {customer.country}
                    </text>
                    <text >{customer.email}</text>
                  </box>
                </box>
              )}
            </For>
          </box>

          <box borderStyle="single" borderColor="gray" padding={1}>
            <text >
              Press 'n' to create new • Press Esc to go back
            </text>
          </box>
        </Show>
      </Show>
    </box>
  )
}
