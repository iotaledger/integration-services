import * as Identity from '@iota/identity-wasm/node';
import { Static } from '@sinclair/typebox';
import {
	VerifiableCredentialSchema,
	VerifiableCredentialSubjectSchema,
	IdentityDocumentSchema,
	IdentityKeyPairJsonSchema,
	IdentityJsonSchema
} from '../schemas/identity';
import {
	CreateIdentityBodySchema,
	LatestIdentityDocSchema,
	IdentitySearchBodySchema
} from '../schemas/request-response-body/identity-bodies';
import { IdentitySchema } from '../schemas/user';
import { IdentityKeysSchema, KeysSchema } from '../schemas/identity';

export interface Bitmap {
	id: string;
	index: number;
	serviceEndpoint: string | string[] | Map<string, string[]> | Record<string, string[]>;
}

export interface VerifiableCredentialPersistence {
	index: number;
	initiatorId: string;
	isRevoked: boolean;
	vc: VerifiableCredentialJson;
}

export interface Credential<T> {
	id: string;
	type: string;
	subject: T;
}

export type IdentitySearchBody = Static<typeof IdentitySearchBodySchema>;

export type IdentityInternal = Static<typeof IdentitySchema>;
export type CreateIdentityBody = Static<typeof CreateIdentityBodySchema>;

export type VerifiableCredentialJson = Static<typeof VerifiableCredentialSchema>;
export type CredentialSubject = Static<typeof VerifiableCredentialSubjectSchema>;

export type IdentityDocument = Static<typeof IdentityDocumentSchema>;
export type IdentityKeyPairJson = Static<typeof IdentityKeyPairJsonSchema>;
export type IdentityJson = Static<typeof IdentityJsonSchema>;
export type LatestIdentityJson = Static<typeof LatestIdentityDocSchema>;

export type IdentityKeys = Static<typeof IdentityKeysSchema>;
export type Keys = Static<typeof KeysSchema>;
