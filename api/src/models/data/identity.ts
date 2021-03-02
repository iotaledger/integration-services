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
