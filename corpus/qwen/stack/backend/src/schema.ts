/**
 * [CORPUS: qwen/stack] Drizzle ORM schema untuk Business API
 * Tags: drizzle, postgres, multi-tenant, api-key, usage-tracking
 */
import { pgTable, uuid, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  credits: integer('credits').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  apiKeyId: uuid('api_key_id').references(() => apiKeys.id),
  endpoint: text('endpoint').notNull(),
  status: integer('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
