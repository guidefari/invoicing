import { Context, Effect, Layer } from "effect"
import { eq } from "drizzle-orm"
import { Database, DatabaseError } from "./Database.ts"
import { businessInfo } from "../db/drizzle-schema.ts"
import type { BusinessInfo } from "../types/index.ts"

export class BusinessInfoService extends Context.Tag("BusinessInfoService")<
  BusinessInfoService,
  {
    readonly get: () => Effect.Effect<BusinessInfo | undefined, DatabaseError>
  }
>() {}

export const BusinessInfoServiceLive = Layer.effect(
  BusinessInfoService,
  Effect.gen(function* () {
    const database = yield* Database

    return {
      get: () =>
        Effect.try({
          try: () => database.db.select().from(businessInfo).where(eq(businessInfo.id, 1)).get(),
          catch: (error) => new DatabaseError("Failed to get business info", error),
        }).pipe(Effect.map((result) => result as BusinessInfo | undefined)),
    }
  })
)
