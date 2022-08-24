import { ApiVersion } from './apiVersion';

export type ClientConfig = {
  apiKey?: string;
  isGatewayUrl?: string;
  useGatewayUrl?: boolean;
  ssiBridgeUrl?: string;
  auditTrailUrl?: string;
  apiVersionAuditTrail: ApiVersion;
  apiVersionSsiBridge: ApiVersion;
  permaNode?: string;
  node?: string;
};
