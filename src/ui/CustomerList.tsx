import { createSignal, createEffect, For, Show } from "solid-js"
import { box, text, useInput } from "@opentui/core"
import { Effect } from "effect"
import { CustomerService } from "../services/CustomerService.ts"
import type { Customer } from "../types/index.ts"

interface CustomerListProps {
  onBack: () => void
}

export function CustomerList(props: CustomerListProps) {
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  createEffect(() => {
    const program = Effect.gen(function* () {
      const service = yield* CustomerService
      return yield* service.list()
    })

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

  useInput((input) => {
    if (input === "n") {
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
