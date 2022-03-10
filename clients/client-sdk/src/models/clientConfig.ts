import { ApiVersion } from "./apiVersion";

export type ClientConfig = {
  apiKey?: string,
  isGatewayUrl?: string,
  ssiBridgeUrl?: string,
  auditTrailUrl?: string,
  apiVersion?: ApiVersion,
}
