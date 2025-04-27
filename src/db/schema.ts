import { pgTable, serial, integer, varchar, boolean, timestamp, text } from "drizzle-orm/pg-core"

export const mindsets = pgTable("mindsets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const methods = pgTable("methods", {
  id: serial("id").primaryKey(),
  mindsetId: integer("mindset_id")
    .references(() => mindsets.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const success_logs = pgTable("success_logs", {
  id: serial("id").primaryKey(),
  mindsetId: integer("mindset_id")
    .references(() => mindsets.id,{
      onDelete: 'cascade',
    })
    .notNull(),
  methodId: integer("method_id")
    .references(() => methods.id,{
      onDelete: 'cascade',
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  memo: text("memo"),
})

export const schema = {
  mindsets,
  methods,
  success_logs,
}
