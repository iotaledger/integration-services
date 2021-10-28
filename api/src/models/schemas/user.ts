import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';
import { ClaimSchema } from './request-response-body/verification-bodies';

export const IdentityWithoutIdFields = {
	username: Type.Optional(Type.String({ minLength: 3 })),
	registrationDate: Type.Optional(Type.String({ format: 'date-time' })),
	verifiableCredentials: Type.Optional(Type.Array(VerifiableCredentialSchema)),
	role: Type.Optional(Type.String()),
	claim: Type.Optional(ClaimSchema),
	isPrivate: Type.Optional(Type.Boolean())
};

export const IdentitySchema = Type.Object({
	identityId: Type.String({ minLength: 50, maxLength: 53 }), // did
	publicKey: Type.String({ minLength: 10 }),
	...IdentityWithoutIdFields
});
