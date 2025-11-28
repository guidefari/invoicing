import { createSignal, createEffect, Show, onMount } from "solid-js"
import { Effect } from "effect"
import { TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/solid"
import type { Customer, CreateCustomerInput } from "../../types/index.ts"
import { CustomerService } from "../../services/CustomerService.ts"
import { AppLayer } from "../../runtime.ts"

type ViewMode = "list" | "form"

export function CustomerScreen() {
  const [viewMode, setViewMode] = createSignal<ViewMode>("list")
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = createSignal<number | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  const loadCustomers = async () => {
    try {
      setLoading(true)
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
  }

  onMount(() => {
    loadCustomers()
  })

  useKeyboard((key) => {
    if (key.name === "escape") {
      if (viewMode() === "form") {
        setSelectedCustomerId(null)
        setViewMode("list")
      }
      return
    }

    if (viewMode() === "list") {
      if (key.name === "n") {
        setSelectedCustomerId(null)
        setViewMode("form")
      }
    }
  })

  const handleCustomerSaved = () => {
    setSelectedCustomerId(null)
    setViewMode("list")
    loadCustomers()
  }

  return (
    <box flexDirection="column" flexGrow={1} height="100%">
      <Show when={viewMode() === "list"}>
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
                  onSelect={(customerId) => {
                    console.log("Selected customer ID:", customerId)
                    setSelectedCustomerId(customerId as number)
                    setViewMode("form")
                  }}
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
      </Show>

      <Show when={viewMode() === "form"}>
        <CustomerForm
          customerId={selectedCustomerId()}
          onSave={handleCustomerSaved}
          onCancel={() => {
            setSelectedCustomerId(null)
            setViewMode("list")
          }}
        />
      </Show>
    </box>
  )
}

type Field = "name" | "vatNumber" | "streetAddress" | "city" | "postalCode" | "country" | "email" | "phone"

function CustomerForm(props: { customerId: number | null; onSave: () => void; onCancel: () => void }) {
  const [formData, setFormData] = createSignal<CreateCustomerInput>({
    name: "",
    vatNumber: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "South Africa",
    email: "",
    phone: "",
  })
  const [focusedField, setFocusedField] = createSignal<Field>("name")
  const [saving, setSaving] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [loading, setLoading] = createSignal(false)

  const fields: Field[] = ["name", "vatNumber", "streetAddress", "city", "postalCode", "country", "email", "phone"]

  createEffect(() => {
    const customerId = props.customerId

    if (customerId) {
      setLoading(true)
      setError(null)

      const loadCustomer = async () => {
        try {
          const program = Effect.gen(function* () {
            const service = yield* CustomerService
            return yield* service.get(customerId)
          })

          const customer = await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
          if (customer) {
            setFormData({
              name: customer.name,
              vatNumber: customer.vatNumber,
              streetAddress: customer.streetAddress,
              city: customer.city,
              postalCode: customer.postalCode,
              country: customer.country,
              email: customer.email,
              phone: customer.phone,
            })
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load customer")
        } finally {
          setLoading(false)
        }
      }

      loadCustomer()
    } else {
      setFormData({
        name: "",
        vatNumber: "",
        streetAddress: "",
        city: "",
        postalCode: "",
        country: "South Africa",
        email: "",
        phone: "",
      })
      setLoading(false)
    }
  })

  const handleSubmit = async () => {
    const data = formData()
    console.log("Form data on submit:", JSON.stringify(data, null, 2))
    if (!data.name || !data.vatNumber || !data.email) {
      setError("Name, VAT Number, and Email are required")
      console.log("Validation failed:", { name: data.name, vatNumber: data.vatNumber, email: data.email })
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (props.customerId) {
        const program = Effect.gen(function* () {
          const service = yield* CustomerService
          return yield* service.update(props.customerId!, data)
        })
        await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      } else {
        const program = Effect.gen(function* () {
          const service = yield* CustomerService
          return yield* service.create(data)
        })
        await Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
      }

      props.onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : props.customerId ? "Failed to update customer" : "Failed to create customer")
      setSaving(false)
    }
  }

  const nextField = () => {
    const currentIndex = fields.indexOf(focusedField())
    const nextIndex = (currentIndex + 1) % fields.length
    const nextFieldValue = fields[nextIndex]
    if (nextFieldValue) setFocusedField(nextFieldValue)
  }

  const prevField = () => {
    const currentIndex = fields.indexOf(focusedField())
    const prevIndex = currentIndex === 0 ? fields.length - 1 : currentIndex - 1
    const prevFieldValue = fields[prevIndex]
    if (prevFieldValue) setFocusedField(prevFieldValue)
  }

  useKeyboard((key) => {
    if (saving()) return

    if (key.ctrl && key.name === "s") {
      key.preventDefault?.()
      handleSubmit()
      return
    }

    if (key.name === "tab") {
      key.preventDefault?.()
      if (key.shift) {
        prevField()
      } else {
        nextField()
      }
      return
    }
  })

  return (
    <box flexDirection="column" flexGrow={1}>
      <text style={{ fg: "#00FF00" }} attributes={TextAttributes.BOLD} marginBottom={1}>
        {props.customerId ? "✏️ Edit Customer" : "✏️ New Customer"}
      </text>

      <Show when={loading()}>
        <text style={{ fg: "#AAAAAA" }}>Loading customer...</text>
      </Show>

      <Show when={!loading()}>
        <box
          border={true}
          borderStyle="single"
          borderColor="#00FF00"
          padding={1}
          flexDirection="column"
          gap={1}
          flexGrow={1}
        >
        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>Name *</text>
          <input
            focused={focusedField() === "name" && !saving()}
            value={formData().name}
            onInput={(value) => setFormData(prev => ({ ...prev, name: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>VAT Number</text>
          <input
            focused={focusedField() === "vatNumber" && !saving()}
            value={formData().vatNumber ?? ""}
            onInput={(value) => setFormData(prev => ({ ...prev, vatNumber: value || null }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>Street Address</text>
          <input
            focused={focusedField() === "streetAddress" && !saving()}
            value={formData().streetAddress}
            onInput={(value) => setFormData(prev => ({ ...prev, streetAddress: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>City</text>
          <input
            focused={focusedField() === "city" && !saving()}
            value={formData().city}
            onInput={(value) => setFormData(prev => ({ ...prev, city: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>Postal Code</text>
          <input
            focused={focusedField() === "postalCode" && !saving()}
            value={formData().postalCode}
            onInput={(value) => setFormData(prev => ({ ...prev, postalCode: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>Country</text>
          <input
            focused={focusedField() === "country" && !saving()}
            value={formData().country}
            onInput={(value) => setFormData(prev => ({ ...prev, country: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>Email *</text>
          <input
            focused={focusedField() === "email" && !saving()}
            value={formData().email}
            onInput={(value) => setFormData(prev => ({ ...prev, email: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <box flexDirection="row" gap={2}>
          <text style={{ fg: "#AAAAAA", width: 15 }}>Phone</text>
          <input
            focused={focusedField() === "phone" && !saving()}
            value={formData().phone}
            onInput={(value) => setFormData(prev => ({ ...prev, phone: value }))}
            style={{ flexGrow: 1 }}
          />
        </box>

        <Show when={error()}>
          <text style={{ fg: "#FF0000" }} marginTop={1}>
            Error: {error()}
          </text>
        </Show>

        <Show when={saving()}>
          <text style={{ fg: "#FFFF00" }} marginTop={1}>
            Saving customer...
          </text>
        </Show>
        </box>
      </Show>

      <box paddingTop={1} borderColor="#333333">
        <text style={{ fg: "#666666" }}>
          [Tab] Next • [Shift+Tab] Previous • [Ctrl+S] Save • [Esc] Cancel
        </text>
      </box>
    </box>
  )
}
