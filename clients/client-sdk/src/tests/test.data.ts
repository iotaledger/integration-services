import { ClientConfig } from '../models';
import { CreateChannelBody, ChannelType } from '@iota/is-shared-modules';

export const apiConfig: ClientConfig = {
  isGatewayUrl: 'http://localhost:3000/api/v0.1',
  useGatewayUrl: true,
  apiKey: '7ef16390-bab8-4d2d-958a-98709d7fb04e',
  apiVersionAuditTrail: 'v0.1',
  apiVersionSsiBridge: 'v0.1'
};

export const adminUser = {
  id: 'did:iota:H9gnk3KXPiopLtwLRm3ooKU3D4oNJz49DDLVXx5xov19',
  secretKey: 'Hn5Sw3yuLVA8HSbf42sqYwa3A9Bd5YfxGRqLMA3L2w8D'
};

export const normalUser = {
  id: 'did:iota:G2xuoUpXYTboDgHWLKcQvEkBviBv9QYDAECtx2GpugqC',
  secretKey: '8jxJoqcKQXRq3YfpWkPM5K6NuC4TWLWJobQR3Svqtv1p'
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
