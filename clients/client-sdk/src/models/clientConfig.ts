import { ApiVersion } from './apiVersion';

export type ClientConfig = {
  apiKey?: string;
  gatewayUrl?: string;
  useGatewayUrl?: boolean;
  ssiBridgeUrl?: string;
  auditTrailUrl?: string;
  apiVersion?: ApiVersion;
};
