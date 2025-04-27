import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { live } from "@electric-sql/pglite/live"

// Initialize PGlite with live extension
export const pgClient = await PGlite.create("idb://mind-updater", {
  extensions: { live },
})

export const db = drizzle(pgClient, { logger: true })
