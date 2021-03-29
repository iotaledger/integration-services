import { Type } from '@sinclair/typebox';
import { VerifiableCredentialSchema } from './identity';

export const VerifyUserSchema = Type.Object({
	subjectId: Type.String({ minLength: 53, maxLength: 53 }), // did
	initiatorVC: VerifiableCredentialSchema
});

export const RevokeVerificationSchema = Type.Object({
	subjectId: Type.String({ minLength: 53, maxLength: 53 }) // did
});
