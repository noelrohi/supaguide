import type { Env } from "@/types";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

config({ path: ".env" }); // or .env.local

export const database = (env: Env) =>
  drizzle({
    connection: {
      url: env.TURSO_CONNECTION_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    },
    schema,
    logger: true,
  });
