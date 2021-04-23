import { Static } from '@sinclair/typebox';
import { UserSchema, UserWithoutIdSchema, VerificationSchema } from '../schemas/user';

export type UserWithoutId = Static<typeof UserWithoutIdSchema>;
export type User = Static<typeof UserSchema> & UserWithoutId;
export type Verification = Static<typeof VerificationSchema>;

export const enum UserType {
	Organization = 'Organization',
	Service = 'Service',
	Person = 'Person',
	Device = 'Device',
	Product = 'Product',
	Unknown = 'Unknown'
}

export const enum UserRoles {
	Admin = 'Admin',
	Manager = 'Manager',
	User = 'User'
}

export interface UserSearch {
	username?: string;
	organization?: string;
	subscribedChannelIds?: string[];
	verified?: boolean;
	registrationDate?: Date;
	type?: UserType | string;
	limit?: number;
	index?: number;
}

type OmittedUser = Omit<User, 'registrationDate' | 'type' | 'verification' | 'role'>;

export interface UserPersistence extends OmittedUser {
	role?: UserRoles;
	verification?: VerificationPersistence;
	registrationDate?: Date;
	type: UserType | string;
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
