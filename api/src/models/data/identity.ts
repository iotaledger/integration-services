import * as Identity from '@iota/identity-wasm/node';
import { Type, Static } from '@sinclair/typebox';
import { UserWithoutId } from './user';

export interface CreateIdentityBody extends UserWithoutId {
	storeIdentity?: boolean;
}

const VcSubjectSchema = Type.Object({
	id: Type.String({ minLength: 53, maxLength: 53 }),
	classification: Type.String({ minLength: 1 }),
	organization: Type.String({ minLength: 1 }),
	registrationDate: Type.String({ minLength: 1 }),
	username: Type.String({ minLength: 1 })
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

export const VerifyUserSchema = Type.Object({
	subjectId: Type.String({ minLength: 53, maxLength: 53 }), // did
	initiatorVC: VerifiableCredentialSchema
});

export type VerifyUserBody = Static<typeof VerifyUserSchema>;
export type VerifiableCredentialJson = Static<typeof VerifiableCredentialSchema>;
export type CredentialSubject = Static<typeof VcSubjectSchema>;

export interface IdentityDocument extends Identity.Document {
	doc: Identity.Document;
	key: Identity.KeyPair;
}

export interface IdentityDocumentJson {
	id: string;
	verificationMethod?: {
		id: string;
		controller: string;
		type: string;
		publicKeyBase58: string;
	}[];
	authentication: {
		id: string;
		controller: string;
		type: string;
		publicKeyBase58: string;
	}[];
	created: string;
	updated: string;
	immutable: boolean;
	proof: {
		type: string;
		verificationMethod: string;
		signatureValue: string;
	};
}

export interface IdentityKeyPairJson {
	type: string;
	public: string;
	secret: string;
}

export interface DocumentJsonUpdate {
	doc: IdentityDocumentJson;
	txHash: string;
}

export interface IdentityJson {
	doc: IdentityDocumentJson;
	key: IdentityKeyPairJson;
	encoding: 'base16' | 'base58' | 'base64';
}

export interface IdentityJsonUpdate extends IdentityJson {
	txHash: string;
}
