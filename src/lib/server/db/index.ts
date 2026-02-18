import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

type PostgresClient = ReturnType<typeof postgres>;
const globalForDb = globalThis as unknown as { __postgresClient?: PostgresClient };

// Reuse a single Postgres client in dev to avoid leaking sockets on HMR reloads.
const client =
	globalForDb.__postgresClient ??
	postgres(env.DATABASE_URL, {
		prepare: false
	});

if (process.env.NODE_ENV !== 'production') {
	globalForDb.__postgresClient = client;
}

export const db = drizzle(client, { schema });
