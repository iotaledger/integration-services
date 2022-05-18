import { ApiVersion, ClientConfig } from '@iota/is-client';

import * as dotenv from 'dotenv';
import { ManagerConfig } from './manager/manager-config';
dotenv.config();

// You can either choose a gateway url and change useGatewayUrl to true (used in production) or the ssiBridgeUrl AND auditTrailUrl (for local testing)
export const defaultConfig: ClientConfig = {
  isGatewayUrl: process.env.IS_GATEWAY_URL,
  ssiBridgeUrl: process.env.SSI_BRIDGE_URL,
  auditTrailUrl: process.env.AUDIT_TRAIL_URL,
  useGatewayUrl: false,
  apiKey: process.env.API_KEY,
  apiVersion: ApiVersion.v01
};

export const defaultManagerConfig: ManagerConfig = {
  mongoURL: process.env.MONGO_URL!,
  databaseName: process.env.DB_NAME!,
  secretKey: process.env.SECRET_KEY!
};
