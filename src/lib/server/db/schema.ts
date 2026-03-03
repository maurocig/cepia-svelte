import { relations } from 'drizzle-orm';
import { boolean, date, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text('role'),
	banned: boolean('banned').default(false),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires')
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

// enrollment-related tables
export const enrollments = pgTable('enrollments', {
	id: text('id').primaryKey(),
	status: text('status').notNull(),
	admissionDate: date('admission_date', { mode: 'string' }).notNull(),
	admissionMode: text('admission_mode'),
	agreementOrganization: text('agreement_organization'),
	agreementOtherName: text('agreement_other_name'),
	agreementExpirationDate: date('agreement_expiration_date', { mode: 'string' }),

	// titular (persona que viene a inscribir)
	holderFirstName: text('holder_first_name').notNull().default(''),
	holderLastName: text('holder_last_name').notNull().default(''),
	holderIdType: text('holder_id_type'),
	holderIdNumber: text('holder_id_number').notNull().default(''),
	holderPhone: text('holder_phone').notNull().default(''),
	holderEmail: text('holder_email').notNull().default(''),

	// tratamientos
	psychology: boolean('psychology').notNull().default(false),
	psychomotricity: boolean('psychomotricity').notNull().default(false),
	speechTherapy: boolean('speech_therapy').notNull().default(false),
	psychopedagogy: boolean('psychopedagogy').notNull().default(false),
	pedagogicalSupport: boolean('pedagogical_support').notNull().default(false),
	physiotherapy: boolean('physiotherapy').notNull().default(false),
	occupationalTherapy: boolean('occupational_therapy').notNull().default(false),
	workshops: boolean('workshops').notNull().default(false),
	treatmentsNotes: text('treatments_notes').notNull().default(''),

	createdByUserId: text('created_by_user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	formStatus: text('form_status').notNull().default('draft'),
	completedAt: timestamp('completed_at')
});

export const patients = pgTable('patients', {
	enrollmentId: text('enrollment_id')
		.primaryKey()
		.references(() => enrollments.id, { onDelete: 'cascade' }),

	enrolledFirstName: text('enrolled_first_name').notNull(),
	enrolledLastName: text('enrolled_last_name').notNull(),
	enrolledDob: date('enrolled_dob', { mode: 'string' }).notNull(),
	enrolledIdType: text('enrolled_id_type').notNull(),
	enrolledIdNumber: text('enrolled_id_number').notNull().unique(),
	enrolledAddress: text('enrolled_address').notNull(),

	responsibleAdultName: text('responsible_adult_name').notNull(),
	responsibleAdultPhone: text('responsible_adult_phone').notNull(),
	consultationReason: text('consultation_reason').notNull(),

	attendsSchool: boolean('attends_school').notNull().default(false),
	schoolType: text('school_type'),
	schoolName: text('school_name'),
	schoolGrade: text('school_grade'),
	schoolShift: text('school_shift'),

	motherDob: date('mother_dob', { mode: 'string' }),
	motherOccupation: text('mother_occupation'),
	fatherDob: date('father_dob', { mode: 'string' }),
	fatherOccupation: text('father_occupation'),
	siblingsCount: integer('siblings_count'),
	familyNotes: text('family_notes'),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const agreementReminders = pgTable(
	'agreement_reminders',
	{
		id: text('id').primaryKey(),
		enrollmentId: text('enrollment_id')
			.notNull()
			.references(() => enrollments.id, { onDelete: 'cascade' }),
		reminderType: text('reminder_type').notNull(), // '90d' | '30d'
		scheduledFor: date('scheduled_for', { mode: 'string' }).notNull(),
		status: text('status').notNull().default('pending'), // 'pending' | 'sent' | 'failed'
		attemptCount: integer('attempt_count').notNull().default(0),
		lastAttemptAt: timestamp('last_attempt_at'),
		sentAt: timestamp('sent_at'),
		resendMessageId: text('resend_message_id'),
		lastError: text('last_error'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('agreement_reminders_unique_instance_idx').on(
			table.enrollmentId,
			table.reminderType,
			table.scheduledFor
		),
		index('agreement_reminders_status_scheduled_idx').on(table.status, table.scheduledFor)
	]
);
