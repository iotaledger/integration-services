import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';
import { ClaimSchema } from './request-response-body/verification-bodies';

export const LocationSchema = Type.Object({
	latitude: Type.Number(),
	longitude: Type.Number()
});

export const IdentityWithoutIdFields = {
	username: Type.Optional(Type.String({ minLength: 3 })),
	registrationDate: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
	verifiableCredentials: Type.Optional(Type.Union([Type.Array(VerifiableCredentialSchema), Type.Null()])),
	role: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	claim: Type.Optional(ClaimSchema),
	isPrivate: Type.Optional(Type.Boolean())
};

export const IdentitySchema = Type.Object({
	identityId: Type.String({ minLength: 50, maxLength: 53 }), // did
	publicKey: Type.String({ minLength: 10 }),
	...IdentityWithoutIdFields
});
