import * as Identity from '@iota/identity-wasm/node';
import { Type, Static } from '@sinclair/typebox';

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

export interface IdentityResponse {
  doc: Identity.Document;
  key: Identity.KeyPair;
  txHash: string;
  explorerUrl: string;
}

export interface KeyCollectionPersistence {
  index: number;
  count: number;
  type: string;
  keys: SimpleKeyPair[];
}

export interface SimpleKeyPair {
  public: string;
  secret: string;
}

export interface KeyCollectionIdentityPersistence {
  keyCollectionIndex: number;
  index: number;
  linkedIdentity?: string;
  isRevoked: boolean;
  revokedIdentity?: string;
}

export interface KeyCollectionJson {
  type: string;
  keys: SimpleKeyPair[];
}
