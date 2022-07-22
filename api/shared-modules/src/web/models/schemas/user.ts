import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';
import { ClaimSchema } from './request-response-body/verification-bodies';

export const IdentityWithoutIdAndCredentialFields = {
	username: Type.String({ minLength: 3 }),
	registrationDate: Type.Optional(Type.String({ format: 'date-time' })),
	creator: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })),
	role: Type.Optional(Type.String()),
	claim: Type.Optional(ClaimSchema),
	hidden: Type.Optional(Type.Boolean({ default: false })),
	isServerIdentity: Type.Optional(Type.Boolean())
};

export const IdentityWithoutIdFields = {
	...IdentityWithoutIdAndCredentialFields,
	verifiableCredentials: Type.Optional(Type.Array(VerifiableCredentialSchema))
};

export const IdentitySchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }), // did

	...IdentityWithoutIdFields
});
