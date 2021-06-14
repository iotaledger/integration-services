import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';

export const VerifyIdentitySchema = Type.Object({
	subjectId: Type.String({ minLength: 50, maxLength: 53 }), // did
	initiatorVC: Type.Optional(VerifiableCredentialSchema),
	checkExistingVC: Type.Optional(Type.Boolean())
});

export const RevokeVerificationSchema = Type.Object({
	signatureValue: Type.String()
});
