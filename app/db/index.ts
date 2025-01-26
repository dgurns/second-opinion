import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DB_FILE_NAME ?? 'file:local.db',
});

export const db = drizzle(client); 