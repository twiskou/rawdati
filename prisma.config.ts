import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  url: process.env.NODE_ENV === "production" ? "file:./prisma/dev.db" : (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL !== "undefined" ? process.env.TURSO_DATABASE_URL : "file:./prisma/dev.db")
});