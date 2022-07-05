import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';
import { ClaimSchema } from './request-response-body/verification-bodies';

export const IdentityWithoutIdFields = {
	username: Type.String({ minLength: 3 }),
	registrationDate: Type.Optional(Type.String({ format: 'date-time' })),
	verifiableCredentials: Type.Optional(Type.Array(VerifiableCredentialSchema)),
	role: Type.Optional(Type.String()),
	claim: Type.Optional(ClaimSchema),
	hidden: Type.Optional(Type.Boolean()),
	isServerIdentity: Type.Optional(Type.Boolean())
};

export const IdentityWithoutIdAndCredentialFields = {
	username: Type.String({ minLength: 3 }),
	registrationDate: Type.Optional(Type.String({ format: 'date-time' })),
	role: Type.Optional(Type.String()),
	claim: Type.Optional(ClaimSchema),
	hidden: Type.Optional(Type.Boolean()),
	isServerIdentity: Type.Optional(Type.Boolean())
};

export const IdentitySchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }), // did
	creator: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })),
	...IdentityWithoutIdFields
});
