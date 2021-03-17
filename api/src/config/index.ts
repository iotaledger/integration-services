import { Config, IdentityConfig } from '../models/config';
import isEmpty from 'lodash/isEmpty';
import * as Identity from '@iota/identity-wasm/node';

const IdentityConfig: IdentityConfig = {
  network: process.env.NETWORK,
  node: process.env.IOTA_PERMA_NODE,
  explorer: process.env.EXPLORER,
  keyType: Identity.KeyType.Ed25519,
  hashFunction: Identity.Digest.Sha256,
  keyCollectionTag: 'key-collection'
};

export const CONFIG: Config = {
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  apiVersion: process.env.API_VERSION,
  databaseUrl: process.env.DATABASE_URL,
  databaseName: process.env.DATABASE_NAME,
  serverIdentityId: process.env.SERVER_IDENTITY,
  serverSecret: process.env.SERVER_SECRET,
  identityConfig: IdentityConfig
};

const assertConfig = (config: Config) => {
  if (config.serverSecret === '<server-secret>' || config.serverIdentityId === '<server-identity>') {
    throw new Error('please replace the default values!');
  }
  Object.values(config).map((value, i) => {
    if (isEmpty(value) && (isNaN(value) || value == null || value === '')) {
      throw new Error(`env var is missing or invalid: ${Object.keys(config)[i]}`);
    }
  });
};

assertConfig(CONFIG);
