import * as Identity from '@iota/identity-wasm/node';
import { Static } from '@sinclair/typebox';
import {
	VerifiableCredentialSchema,
	VerifiableCredentialSubjectSchema,
	IdentityDocumentJsonSchema,
	IdentityKeyPairJsonSchema,
	IdentityJsonSchema
} from '../schemas/identity';
import { CreateIdentityBodySchema } from '../schemas/request-response-body/identity-bodies';

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
export type IdentityKeyPairJson = Static<typeof IdentityKeyPairJsonSchema>;
export type IdentityJson = Static<typeof IdentityJsonSchema>;

export interface IdentityKeys {
	id: string;
	key: IdentityKeyPairJson;
}
