import { PGlite } from "@electric-sql/pglite"
import { live } from "@electric-sql/pglite/live"
import { drizzle as PgLiteDrizzle, type PgliteDatabase } from "drizzle-orm/pglite"
import { schema } from "@/db/schema"

// Initialize PGlite with live extension
export const pgClient = await PGlite.create("idb://mind-updater", {
  extensions: { live },
})

export type DrizzleClient = PgliteDatabase<typeof schema>

export const db = PgLiteDrizzle(pgClient, {
  schema,
  casing: "camelCase",
  logger: true,
})
