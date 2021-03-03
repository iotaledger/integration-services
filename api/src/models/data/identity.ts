import * as Identity from '@iota/identity-wasm/node';
import { UserClassification } from './user';

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

export interface UserCredential {
  id: string;
  username: string;
  organization: string;
  registrationDate: string;
  classification: UserClassification;
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
  linkedIdentity: string;
  isRevoked: boolean;
}

export interface KeyCollectionJson {
  type: string;
  keys: SimpleKeyPair[];
}
