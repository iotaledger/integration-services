import * as Identity from '@iota/identity-wasm/node';

export interface IdentityDocument {
  doc: Identity.Document;
  key: Identity.KeyPair;
}

export interface IdentityResponse {
  doc: Identity.Document;
  key: Identity.KeyPair;
  txHash: string;
  explorerUrl: string;
}
