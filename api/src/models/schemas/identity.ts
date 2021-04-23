import { Type } from '@sinclair/typebox';

export const VcSubjectSchema = Type.Object({
	id: Type.String({ minLength: 53, maxLength: 53 }),
	type: Type.String({ minLength: 1 }),
	organization: Type.String({ minLength: 1 }),
	registrationDate: Type.String({ minLength: 1 }),
	username: Type.String({ minLength: 1 }),
	initiatorId: Type.String({ minLength: 53, maxLength: 53 })
});

export const VerifiableCredentialSchema = Type.Object({
	'@context': Type.String(),
	id: Type.String({ minLength: 53, maxLength: 53 }),
	type: Type.Array(Type.String({ minLength: 1 })),
	credentialSubject: VcSubjectSchema,
	issuer: Type.String({ minLength: 53, maxLength: 53 }),
	issuanceDate: Type.String({ minLength: 1 }),
	proof: Type.Object({
		type: Type.String({ minLength: 1 }),
		verificationMethod: Type.String({ minLength: 1 }),
		signatureValue: Type.String({ minLength: 1 })
	})
});
