import { Static } from '@sinclair/typebox';
import { UserSchema, UserWithoutIdSchema, VerificationSchema } from '../schemas/user';

export type UserWithoutId = Static<typeof UserWithoutIdSchema>;
export type User = Static<typeof UserSchema> & UserWithoutId;
export type Verification = Static<typeof VerificationSchema>;

export const enum UserClassification {
	'human' = 'human',
	'api' = 'api',
	'organization' = 'organization',
	'device' = 'device',
	'product' = 'product',
	'unknown' = 'unknown'
}

export const enum UserRoles {
	'Admin' = 'admin',
	'OrgAdmin' = 'org-admin',
	'User' = 'user'
}

export interface UserSearch {
	username?: string;
	organization?: string;
	subscribedChannelIds?: string[];
	verified?: boolean;
	registrationDate?: Date;
	classification?: UserClassification | string;
	limit?: number;
	index?: number;
}

type OmittedUser = Omit<User, 'registrationDate' | 'classification' | 'verification' | 'role'>;

export interface UserPersistence extends OmittedUser {
	role?: UserRoles;
	verification?: VerificationPersistence;
	registrationDate?: Date;
	classification: UserClassification | string;
}

export interface VerificationPersistence {
	verified: boolean;
	verificationIssuerId?: string;
	verificationDate?: Date;
	lastTimeChecked?: Date;
}

export interface VerificationUpdate extends Verification {
	userId: string;
}

export interface VerificationUpdatePersistence extends VerificationPersistence {
	userId: string;
}
