import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from '../identity';

export const VerifiableCredentialBodySchema = VerifiableCredentialSchema;
export const VerifyIdentityBodySchema = Type.Object({
	subjectId: Type.String({ minLength: 50, maxLength: 53 }), // did
	initiatorVC: Type.Optional(VerifiableCredentialSchema),
	checkExistingVC: Type.Optional(Type.Boolean())
});

export const RevokeVerificationBodySchema = Type.Object({
	signatureValue: Type.String()
});
