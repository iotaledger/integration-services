import * as Identity from '@iota/identity-wasm/node';
import { Static } from '@sinclair/typebox';
import { VerifiableCredentialSchema, VcSubjectSchema } from '../schemas/identity';
import { UserWithoutId } from './user';

export interface Credential<T> {
	id: string;
	type: string;
	subject: T;
}

export interface CreateIdentityBody extends UserWithoutId {
	storeIdentity?: boolean;
}

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
	previousMessageId?: string;
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
	encoding: 'base16' | 'base58' | 'base64';
}

export interface DocumentJsonUpdate {
	doc: IdentityDocumentJson;
	txHash: string;
}

export interface IdentityJson {
	doc: IdentityDocumentJson;
	key: IdentityKeyPairJson;
}

export interface IdentityJsonUpdate extends IdentityJson {
	txHash: string;
}
