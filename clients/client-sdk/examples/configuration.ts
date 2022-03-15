import { ApiVersion, ClientConfig } from '@iota/is-client-sdk';

import * as dotenv from 'dotenv';
dotenv.config();

// You can either choose a gateway url (used in production) or the ssiBridgeUrl AND auditTrailUrl (for local testing)
export const defaultConfig: ClientConfig = {
  isGatewayUrl: process.env.IS_GATEWAY_URL,
  ssiBridgeUrl: process.env.SSI_BRIDGE_URL,
  auditTrailUrl: process.env.AUDIT_TRAIL_URL,
  apiKey: process.env.API_KEY,
  apiVersion: ApiVersion.v01
};
