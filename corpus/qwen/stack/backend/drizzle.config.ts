/**
 * [CORPUS: qwen/stack] Drizzle Kit config
 * Tags: drizzle-kit, postgres, migration
 */
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
