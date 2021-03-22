import { Type, Static } from '@sinclair/typebox';

const LocationSchema = Type.Object({
	latitude: Type.Number(),
	longitude: Type.Number()
});

const VerificationSchema = Type.Object({
	verified: Type.Boolean(),
	verificationIssuerId: Type.Optional(Type.String()), // did
	verificationDate: Type.Optional(Type.String()),
	lastTimeChecked: Type.Optional(Type.String())
});

const UserWithoutIdFields = {
	username: Type.String({ minLength: 3 }),
	firstName: Type.Optional(Type.String()),
	lastName: Type.Optional(Type.String()),
	organization: Type.Optional(Type.String({ minLength: 2 })),
	subscribedChannelIds: Type.Array(Type.String()),
	registrationDate: Type.Optional(Type.String()),
	verification: Type.Optional(VerificationSchema),
	classification: Type.String({ minLength: 3 }),
	description: Type.Optional(Type.String()),
	location: Type.Optional(LocationSchema),
	organizationUrl: Type.Optional(Type.String())
};

export const UserWithoutIdSchema = Type.Object({
	...UserWithoutIdFields
});

export const UserSchema = Type.Object({
	userId: Type.String({ minLength: 53, maxLength: 53 }), // did
	publicKey: Type.String({ minLength: 10 }),
	...UserWithoutIdFields
});

export type UserWithoutId = Static<typeof UserWithoutIdSchema>;
export type User = Static<typeof UserSchema> & UserWithoutId;
export type Verification = Static<typeof VerificationSchema>;

export const enum UserClassification {
	'human' = 'human',
	'device' = 'device',
	'api' = 'api'
}

export interface UserSearch {
	username?: string;
	organization?: string;
	subscribedChannelIds?: string[];
	verified?: boolean;
	registrationDate?: Date;
	classification?: UserClassification;
	limit?: number;
	index?: number;
}

type OmittedUser = Omit<User, 'registrationDate' | 'classification' | 'verification'>;

export interface UserPersistence extends OmittedUser {
	verification?: VerificationPersistence;
	registrationDate?: Date;
	classification: UserClassification;
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
