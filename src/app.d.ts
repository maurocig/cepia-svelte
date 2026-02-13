import type { Session } from 'better-auth';

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			user: Session['user'] | null;
		}

		interface PageData {
			session?: Session | null;
		}
	}
}

export {};
