import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';

export const LocationSchema = Type.Object({
	latitude: Type.Number(),
	longitude: Type.Number()
});

export const VerificationSchema = Type.Object({
	verified: Type.Boolean(),
	verificationIssuerId: Type.Optional(Type.String()), // did
	verificationDate: Type.Optional(Type.String()),
	lastTimeChecked: Type.Optional(Type.String())
});

const UserWithoutIdFields = {
	username: Type.String({ minLength: 3 }),
	classification: Type.String({ minLength: 3 }),
	firstName: Type.Optional(Type.String()),
	lastName: Type.Optional(Type.String()),
	organization: Type.Optional(Type.String({ minLength: 2 })),
	subscribedChannelIds: Type.Optional(Type.Array(Type.String())),
	registrationDate: Type.Optional(Type.String()),
	verification: Type.Optional(VerificationSchema),
	description: Type.Optional(Type.String()),
	location: Type.Optional(LocationSchema),
	organizationUrl: Type.Optional(Type.String()),
	verifiableCredentials: Type.Optional(Type.Array(VerifiableCredentialSchema))
};

export const UserWithoutIdSchema = Type.Object({
	...UserWithoutIdFields
});

export const UserSchema = Type.Object({
	userId: Type.String({ minLength: 53, maxLength: 53 }), // did
	publicKey: Type.String({ minLength: 10 }),
	...UserWithoutIdFields
});

export const UpdateUserSchema = Type.Object({
	userId: Type.String({ minLength: 53, maxLength: 53 }) // did
});
