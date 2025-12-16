import { describe, test, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { BusinessInfoService, BusinessInfoServiceLive } from "./BusinessInfoService.ts"
import { TestDatabaseLive } from "../db/test-utils.ts"
import type { CreateBusinessInfoInput } from "../types/index.ts"

const TestLayer = Layer.provide(BusinessInfoServiceLive, TestDatabaseLive)

const runTest = <A, E>(effect: Effect.Effect<A, E, BusinessInfoService>) =>
  Effect.runPromise(Effect.provide(effect, TestLayer))

describe("BusinessInfoService", () => {
  test("should return undefined when no business info exists", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        return yield* service.get()
      })
    )

    expect(result).toBeUndefined()
  })

  test("should create business info when it doesn't exist", async () => {
    const input: CreateBusinessInfoInput = {
      companyName: "Acme Corp",
      streetAddress: "123 Main St",
      city: "Johannesburg",
      postalCode: "2000",
      country: "South Africa",
      vatNumber: "VAT123456",
      email: "contact@acme.com",
      phone: "+27 11 123 4567",
      logoPath: "/path/to/logo.png",
      accountHolderName: "John Doe",
      bankName: "Standard Bank",
      accountNumber: "1234567890",
      branchCode: "051001",
    }

    const businessInfo = await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        return yield* service.createOrUpdate(input)
      })
    )

    expect(businessInfo.id).toBe(1)
    expect(businessInfo.companyName).toBe(input.companyName)
    expect(businessInfo.streetAddress).toBe(input.streetAddress)
    expect(businessInfo.city).toBe(input.city)
    expect(businessInfo.postalCode).toBe(input.postalCode)
    expect(businessInfo.country).toBe(input.country)
    expect(businessInfo.vatNumber).toBe(input.vatNumber)
    expect(businessInfo.email).toBe(input.email)
    expect(businessInfo.phone).toBe(input.phone)
    expect(businessInfo.logoPath).toBe(input.logoPath!)
    expect(businessInfo.accountHolderName).toBe(input.accountHolderName)
    expect(businessInfo.bankName).toBe(input.bankName)
    expect(businessInfo.accountNumber).toBe(input.accountNumber)
    expect(businessInfo.branchCode).toBe(input.branchCode)
  })

  test("should get business info after creation", async () => {
    const input: CreateBusinessInfoInput = {
      companyName: "Test Corp",
      streetAddress: "456 Test St",
      city: "Cape Town",
      postalCode: "8001",
      country: "South Africa",
      vatNumber: "VAT987654",
      email: "test@corp.com",
      phone: "+27 21 987 6543",
      accountHolderName: "Jane Smith",
      bankName: "FNB",
      accountNumber: "0987654321",
      branchCode: "250655",
    }

    // Test both create and get in the same Effect context
    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        const created = yield* service.createOrUpdate(input)
        const retrieved = yield* service.get()
        return { created, retrieved }
      })
    )

    expect(result.created).toBeDefined()
    expect(result.created.companyName).toBe(input.companyName)
    expect(result.retrieved).toBeDefined()
    expect(result.retrieved!.companyName).toBe(input.companyName)
    expect(result.retrieved!.email).toBe(input.email)
  })

  test("should update business info when it already exists", async () => {
    const originalInput: CreateBusinessInfoInput = {
      companyName: "Original Corp",
      streetAddress: "123 Original St",
      city: "Johannesburg",
      postalCode: "2000",
      country: "South Africa",
      vatNumber: "VAT111111",
      email: "original@corp.com",
      phone: "+27 11 111 1111",
      accountHolderName: "Original Holder",
      bankName: "Original Bank",
      accountNumber: "1111111111",
      branchCode: "111111",
    }

    const updatedInput: CreateBusinessInfoInput = {
      companyName: "Updated Corp",
      streetAddress: "456 Updated St",
      city: "Cape Town",
      postalCode: "8001",
      country: "South Africa",
      vatNumber: "VAT222222",
      email: "updated@corp.com",
      phone: "+27 21 222 2222",
      accountHolderName: "Updated Holder",
      bankName: "Updated Bank",
      accountNumber: "2222222222",
      branchCode: "222222",
    }

    // Create original
    await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        return yield* service.createOrUpdate(originalInput)
      })
    )

    // Update
    const updated = await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        return yield* service.createOrUpdate(updatedInput)
      })
    )

    expect(updated.companyName).toBe(updatedInput.companyName)
    expect(updated.email).toBe(updatedInput.email)
    expect(updated.phone).toBe(updatedInput.phone)
  })

  test("should update business info with partial data", async () => {
    const originalInput: CreateBusinessInfoInput = {
      companyName: "Partial Test Corp",
      streetAddress: "789 Partial St",
      city: "Durban",
      postalCode: "4001",
      country: "South Africa",
      vatNumber: "VAT333333",
      email: "partial@test.com",
      phone: "+27 31 333 3333",
      accountHolderName: "Partial Holder",
      bankName: "Partial Bank",
      accountNumber: "3333333333",
      branchCode: "333333",
    }

    const result = await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        // Create original
        yield* service.createOrUpdate(originalInput)
        // Update partially
        const updated = yield* service.update({
          companyName: "Partially Updated Corp",
          email: "partially@updated.com",
        })
        return updated
      })
    )

    expect(result.companyName).toBe("Partially Updated Corp")
    expect(result.email).toBe("partially@updated.com")
    // Other fields should remain unchanged
    expect(result.phone).toBe(originalInput.phone)
    expect(result.city).toBe(originalInput.city)
  })

  test("should fail to update when business info doesn't exist", async () => {
    await expect(
      runTest(
        Effect.gen(function* () {
          const service = yield* BusinessInfoService
          return yield* service.update({ companyName: "Should Fail" })
        })
      )
    ).rejects.toThrow("Business info not found")
  })

  test("should handle logoPath updates including null", async () => {
    const input: CreateBusinessInfoInput = {
      companyName: "Logo Test Corp",
      streetAddress: "999 Logo St",
      city: "Pretoria",
      postalCode: "0001",
      country: "South Africa",
      vatNumber: "VAT444444",
      email: "logo@test.com",
      phone: "+27 12 444 4444",
      logoPath: "/original/logo.png",
      accountHolderName: "Logo Holder",
      bankName: "Logo Bank",
      accountNumber: "4444444444",
      branchCode: "444444",
    }

    const results = await runTest(
      Effect.gen(function* () {
        const service = yield* BusinessInfoService
        // Create with logo
        yield* service.createOrUpdate(input)
        // Update to remove logo (set to null)
        const updated = yield* service.update({ logoPath: null })
        // Update to add logo back
        const updatedWithLogo = yield* service.update({ logoPath: "/new/logo.png" })
        return { updated, updatedWithLogo }
      })
    )

    expect(results.updated.logoPath).toBeNull()
    expect(results.updatedWithLogo.logoPath).toBe("/new/logo.png")
  })
})