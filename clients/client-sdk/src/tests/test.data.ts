import { ClientConfig } from '../models';
import { CreateChannelBody, ChannelType } from '@iota/is-shared-modules';
import { ApiVersion } from '../models/apiVersion';

export const apiConfig: ClientConfig = {
  isGatewayUrl: 'http://localhost:3000',
  useGatewayUrl: true,
  apiKey: '1cfa3bce-654d-41f6-a82a-94308dc4adf8',
  apiVersionAuditTrail: ApiVersion.v1,
  apiVersionSsiBridge: ApiVersion.v2
};

export const adminUser = {
  id: 'did:iota:AucTBMLZQGXuNSUEpu19TFFCHU75DGrcQw4eYkxqfYRH',
  secretKey: 'ApunZiF7GpjCsZXZPzBBxeX3NDydm2S4smYuVpHHx48C'
};

export const normalUser = {
  id: 'did:iota:BYZfez7JjvHJtirFNQ3LMHHwpvf7gxmbeTpNaNe1aJ6j',
  secretKey: '98cXSPbRtUPmWSkNAUvA2MkC1Sb33BTjDj3Ev2UbQYxt'
};

export const testChannel: CreateChannelBody = {
  description: 'channelForTesting',
  type: ChannelType.private,
  hasPresharedKey: false,
  seed: `randomSeed-${Math.ceil(Math.random() * 100000)}`,
  name: `testChannel-${Math.ceil(Math.random() * 100000)}`,
  topics: [{ type: 'data', source: 'test' }]
};

export const testChannelWrite = {
  type: 'test-channel-data',
  created: new Date().toISOString(),
  metadata: 'client-sdk-jest',
  publicPayload: 'This message was created within a test suit in the @iota/is-client',
  payload: 'This message was created within a test suit in the @iota/is-client'
};
