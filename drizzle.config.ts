import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// dado que es probable que el import de dotenv/config solo busque en un .env lo configuramos antes
dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
