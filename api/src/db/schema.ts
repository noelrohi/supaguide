import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { sqliteTable } from "drizzle-orm/sqlite-core";

const NOW = sql`CURRENT_TIMESTAMP`;

export const demos = sqliteTable("demos", (t) => ({
  id: t.text().primaryKey().$default(createId),
  isDraft: t.integer({ mode: "boolean" }).default(false),
  title: t.text(),
}));

export const clicks = sqliteTable("clicks", (t) => ({
  id: t.text().primaryKey().$default(createId),
  demoId: t.text().notNull(),
  x: t.integer().notNull(),
  y: t.integer().notNull(),
  elementHTML: t.text(),
  elementContent: t.text(),
  imageUrl: t.text().notNull(),
  createdAt: t.text().notNull().default(NOW),
  updatedAt: t.text().$onUpdate(() => NOW),
}));

export const demoRelations = relations(demos, ({ many }) => ({
  clicks: many(clicks),
}));

export const clickRelations = relations(clicks, ({ one }) => ({
  demo: one(demos, {
    fields: [clicks.demoId],
    references: [demos.id],
  }),
}));
