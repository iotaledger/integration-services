import * as Identity from '@iota/identity-wasm/node';
import { Type, Static } from '@sinclair/typebox';
import { UserWithoutId } from './user';

export interface CreateIdentityBody extends UserWithoutId {
  storeIdentity?: boolean;
}

export const UserCredentialSchema = Type.Object({
  id: Type.String(), // did
  username: Type.String(),
  organization: Type.String(),
  registrationDate: Type.String(),
  classification: Type.String()
});

export type UserCredential = Static<typeof UserCredentialSchema>;

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
export interface IdentityResponse {
  doc: Identity.Document;
  key: Identity.KeyPair;
  txHash: string;
  explorerUrl: string;
}
