import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from '../identity';

export const VerifiableCredentialBodySchema = VerifiableCredentialSchema;
export const VerifyIdentityBodySchema = Type.Object({
	subjectId: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })), // did
	subject: Type.Optional(Type.Any()),
	initiatorVC: Type.Optional(VerifiableCredentialSchema)
});

export const RevokeVerificationBodySchema = Type.Object({
	signatureValue: Type.String()
});
