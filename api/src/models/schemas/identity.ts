import { Type } from '@sinclair/typebox';

export enum Encoding {
	base16 = "base16",
	base58 = "base58",
	base64 = "base64"
}

export const VcSubjectSchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }),
	type: Type.String({ minLength: 1 }),
	initiatorId: Type.Optional(Type.String({ minLength: 50, maxLength: 53 }))
});

export const VerifiableCredentialSchema = Type.Object({
	'@context': Type.String(),
	id: Type.String({ minLength: 50, maxLength: 53 }),
	type: Type.Array(Type.String({ minLength: 1 })),
	credentialSubject: VcSubjectSchema,
	issuer: Type.String({ minLength: 50, maxLength: 53 }),
	issuanceDate: Type.String({ minLength: 1 }),
	proof: Type.Object({
		type: Type.String({ minLength: 1 }),
		verificationMethod: Type.String({ minLength: 1 }),
		signatureValue: Type.String({ minLength: 1 })
	})
});

export const IdentityDocumentJsonSchema = Type.Object({
	id: Type.String({ minLength: 50, maxLength: 53 }),
	verificationMethod: Type.Optional(Type.Array(Type.Object({
		id: Type.String({ minLength: 50, maxLength: 53 }),
		controller: Type.String(),
		type: Type.String(),
		publicKeyBase58: Type.String()
	}))),
	previousMessageId: Type.Optional(Type.String({ minLength: 50, maxLength: 53 })),
	authentication: Type.Array(Type.Object({
		id: Type.String({ minLength: 50, maxLength: 53 }),
		controller: Type.String(),
		type: Type.String(),
		publicKeyBase58: Type.String()
	})),
	created: Type.String({ format: 'date-time', minLength: 1 }),
	updated: Type.String({ format: 'date-time', minLength: 1 }),
	immutable: Type.Boolean(),
	proof: Type.Object({
		type: Type.String(),
		verificationMethod: Type.String(),
		signatureValue: Type.String()
	})
});

export const LatestIdentityJsonSchema = Type.Object({
	document: IdentityDocumentJsonSchema,
	messageId: Type.String()
});

export const IdentityKeyPairJsonSchema = Type.Object({
	type: Type.String(),
	public: Type.String(),
	secret: Type.String(),
	encoding: Type.Enum(Encoding)
});

export const IdentityJsonSchema = Type.Object({
	doc: IdentityDocumentJsonSchema,
	key: IdentityKeyPairJsonSchema
});

export const DocumentJsonUpdateSchema = Type.Object({
	doc: IdentityDocumentJsonSchema,
	txHash: Type.String()
})

export const IdentityJsonUpdateSchema = Type.Object({
	doc: IdentityDocumentJsonSchema,
	key: IdentityKeyPairJsonSchema,
	txHash: Type.String()
})

