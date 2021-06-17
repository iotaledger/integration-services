import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from '../identity';

export const VerifiableCredentialBodySchema = VerifiableCredentialSchema;

export const ClaimSchema = Type.Object({
	type: Type.String({ minLength: 1 })
});
export const SubjectBodySchema = Type.Object({
	identityId: Type.String({ minLength: 50, maxLength: 53 }), // did
	credentialType: Type.String(),
	claim: ClaimSchema
});

export const VerifyIdentityBodySchema = Type.Object({
	// subjectId: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })), // did
	subject: SubjectBodySchema,
	initiatorVC: Type.Optional(VerifiableCredentialSchema)
});

export const RevokeVerificationBodySchema = Type.Object({
	signatureValue: Type.String()
});
