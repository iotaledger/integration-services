import { Type } from '@sinclair/typebox';
import { UserType } from '../../types/user';
import { VerifiableCredentialSchema } from '../identity';

export const VerifiableCredentialBodySchema = VerifiableCredentialSchema;

export const ClaimSchema = Type.Object({
	type: Type.Union([Type.Enum(UserType), Type.String({ minLength: 3 })])
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
