import * as Identity from '@iota/identity-wasm/node';
import { Type } from '@sinclair/typebox';

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

export const IdentitySchema = Type.Object({
  username: Type.Optional(Type.String()),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  organization: Type.Optional(Type.String()),
  subscribedChannelIds: Type.Array(Type.String()),
  registrationDate: Type.Optional(Type.String()),
  classification: Type.String(),
  description: Type.Optional(Type.String())
});
