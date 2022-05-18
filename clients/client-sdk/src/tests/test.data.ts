import { ApiVersion } from '..';
import { ClientConfig } from '../models';
import { CreateChannelBody } from '../../../../api/shared-modules/src/models/types/request-response-bodies';
import { ChannelType } from '../../../../api/shared-modules/src/models/schemas/channel-info';

export const apiConfig: ClientConfig = {
  isGatewayUrl: '',
  ssiBridgeUrl: 'http://localhost:3001',
  auditTrailUrl: 'http://localhost:3002',
  apiVersion: ApiVersion.v01,
  useGatewayUrl: false
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
