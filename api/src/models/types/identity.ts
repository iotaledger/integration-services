import * as Identity from '@iota/identity-wasm/node';
import { Static } from '@sinclair/typebox';
import {
	VerifiableCredentialSchema,
	VerifiableCredentialSubjectSchema,
	IdentityDocumentJsonSchema,
	IdentityKeyPairJsonSchema,
	DocumentJsonUpdateSchema,
	IdentityJsonSchema,
	LatestIdentityJsonSchema
} from '../schemas/identity';
import { CreateIdentityBodySchema } from '../schemas/request-response-body/identity-bodies';
import { Encoding } from '../schemas/identity';

export interface Credential<T> {
	id: string;
	type: string;
	subject: T;
}

export interface IdentityDocument extends Identity.Document {
	doc: Identity.Document;
	key: Identity.KeyPair;
}

export type CreateIdentityBody = Static<typeof CreateIdentityBodySchema>;

export type VerifiableCredentialJson = Static<typeof VerifiableCredentialSchema>;
export type CredentialSubject = Static<typeof VerifiableCredentialSubjectSchema>;

export type IdentityDocumentJson = Static<typeof IdentityDocumentJsonSchema>;
export type LatestIdentityJson = Static<typeof LatestIdentityJsonSchema>;
export type IdentityKeyPairJson = Static<typeof IdentityKeyPairJsonSchema>;
export type DocumentJsonUpdate = Static<typeof DocumentJsonUpdateSchema>;
export type IdentityJson = Static<typeof IdentityJsonSchema>;

export interface IdentityKeys {
	id: string;
	key: {
		type: string;
		public: string;
		secret: string;
		encoding: Encoding;
	};
}
