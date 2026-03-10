import 'dotenv/config';

import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { account, user } from '../src/lib/server/db/schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME?.trim() || 'Admin';

if (!adminEmail || !adminPassword) {
	throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
}

const client = postgres(databaseUrl, { prepare: false });
const db = drizzle(client, { schema: { user, account } });

const now = new Date();
const passwordHash = await hashPassword(adminPassword);

const existingUser = await db.query.user.findFirst({
	where: eq(user.email, adminEmail)
});

if (!existingUser) {
	const userId = nanoid();

	await db.insert(user).values({
		id: userId,
		name: adminName,
		email: adminEmail,
		emailVerified: true,
		role: 'admin',
		createdAt: now,
		updatedAt: now
	});

	await db.insert(account).values({
		id: nanoid(),
		accountId: userId,
		providerId: 'credential',
		userId,
		password: passwordHash,
		createdAt: now,
		updatedAt: now
	});

	console.log(`Created admin user: ${adminEmail}`);
} else {
	await db
		.update(user)
		.set({
			name: adminName,
			role: 'admin',
			emailVerified: true,
			updatedAt: now
		})
		.where(eq(user.id, existingUser.id));

	const existingCredential = await db.query.account.findFirst({
		where: and(eq(account.userId, existingUser.id), eq(account.providerId, 'credential'))
	});

	if (!existingCredential) {
		await db.insert(account).values({
			id: nanoid(),
			accountId: existingUser.id,
			providerId: 'credential',
			userId: existingUser.id,
			password: passwordHash,
			createdAt: now,
			updatedAt: now
		});
	} else {
		await db
			.update(account)
			.set({
				password: passwordHash,
				updatedAt: now
			})
			.where(eq(account.id, existingCredential.id));
	}

	console.log(`Updated admin user: ${adminEmail}`);
}

await client.end({ timeout: 5 });
