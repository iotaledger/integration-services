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
	subscribedChannelIds: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
	registrationDate: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	verification: Type.Optional(Type.Union([VerificationSchema, Type.Null()])),
	description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	organization: Type.Optional(Type.Union([Type.String({ minLength: 2 }), Type.Null()])),
	verifiableCredentials: Type.Optional(Type.Union([Type.Array(VerifiableCredentialSchema), Type.Null()])),
	role: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	details: Type.Optional(Type.Union([Type.Any(), Type.Null()]))
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
