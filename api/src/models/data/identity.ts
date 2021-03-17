import * as Identity from '@iota/identity-wasm/node';
import { Type, Static } from '@sinclair/typebox';
import { UserWithoutId } from './user';

export interface CreateIdentityBody extends UserWithoutId {
  storeIdentity?: boolean;
}

export const UserCredentialSchema = Type.Object({
  id: Type.String({ minLength: 53, maxLength: 53 }), // did
  username: Type.String({ minLength: 3 }),
  organization: Type.String({ minLength: 2 }),
  registrationDate: Type.String(),
  classification: Type.String({ minLength: 3 })
});

export type UserCredential = Static<typeof UserCredentialSchema>;

export interface IdentityDocument extends Identity.Document {
  doc: Identity.Document;
  key: Identity.KeyPair;
}

export interface IdentityDocumentJson {
  id: string;
  txHash: string;
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
  type: Identity.Digest;
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
}

export interface IdentityJsonUpdate extends IdentityJson {
  txHash: string;
}
