import * as Identity from '@iota/identity-wasm/node';
import { Static } from '@sinclair/typebox';
import {
	VerifiableCredentialSchema,
	VerifiableCredentialSubjectSchema,
	IdentityDocumentJsonSchema,
	IdentityKeyPairJsonSchema,
	IdentityJsonSchema
} from '../schemas/identity';
import { CreateIdentityBodySchema, LatestIdentityDocSchema, IdentitySearchBodySchema } from '../schemas/request-response-body/identity-bodies';
import { IdentitySchema } from '../schemas/user';

export interface Credential<T> {
	id: string;
	type: string;
	subject: T;
}

export interface IdentityDocument extends Identity.Document {
	doc: Identity.Document;
	key: Identity.KeyPair;
}

export type IdentitySearchBody = Static<typeof IdentitySearchBodySchema>

export type IdentityInternal = Static<typeof IdentitySchema>
export type CreateIdentityBody = Static<typeof CreateIdentityBodySchema>;

export type VerifiableCredentialJson = Static<typeof VerifiableCredentialSchema>;
export type CredentialSubject = Static<typeof VerifiableCredentialSubjectSchema>;

export type IdentityDocumentJson = Static<typeof IdentityDocumentJsonSchema>;
export type IdentityKeyPairJson = Static<typeof IdentityKeyPairJsonSchema>;
export type IdentityJson = Static<typeof IdentityJsonSchema>;
export type LatestIdentityJson = Static<typeof LatestIdentityDocSchema>;

export interface IdentityKeys {
	id: string;
	key: IdentityKeyPairJson;
}
