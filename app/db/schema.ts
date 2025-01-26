import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const medicalDetailsTable = sqliteTable("medical_details", {
  id: int().primaryKey({ autoIncrement: true }),
  details: text("details").notNull(),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});