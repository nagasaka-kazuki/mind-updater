import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const mindsets = pgTable("mindsets", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const methods = pgTable("methods", {
  id: uuid("id").primaryKey(),
  mindsetId: uuid("mindset_id")
    .references(() => mindsets.id, {
      onDelete: "cascade",
    })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const success_logs = pgTable("success_logs", {
  id: uuid("id").primaryKey(),
  mindsetId: uuid("mindset_id")
    .references(() => mindsets.id, {
      onDelete: "cascade",
    })
    .notNull(),
  methodId: uuid("method_id").references(() => methods.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  memo: text("memo"),
});

export const schema = {
  mindsets,
  methods,
  success_logs,
};

export const mindsetsInsertSchema = createInsertSchema(mindsets);
export type MindsetInsert = z.infer<typeof mindsetsInsertSchema>;

export const mindsetsSelectSchema = createSelectSchema(mindsets);
export type Mindset = z.infer<typeof mindsetsSelectSchema>;

export const methodsInsertSchema = createInsertSchema(methods);
export type MethodInsert = z.infer<typeof methodsInsertSchema>;

export const methodsSelectSchema = createSelectSchema(methods);
export type Method = z.infer<typeof methodsSelectSchema>;

export const successLogsSelectSchema = createSelectSchema(success_logs);
export type SuccessLog = z.infer<typeof successLogsSelectSchema>;

export const successLogsInsertSchema = createInsertSchema(success_logs);
export type SuccessLogInsert = z.infer<typeof successLogsInsertSchema>;
