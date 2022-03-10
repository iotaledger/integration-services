export * from './searchCriteria';

export * from './clientConfig';

export * from './apiVersion';

// Export channel types
export { ChannelData } from '@iota/is-shared-modules/lib/models/types/channel-data';
export {
  ChannelInfo,
  ChannelInfoSearch
} from '@iota/is-shared-modules/lib/models/types/channel-info';
export {
  AddChannelLogBody,
  CreateChannelBody,
  CreateChannelResponse,
  ReimportBody,
  ValidateBody,
  ValidateResponse,
  AuthorizeSubscriptionBody,
  AuthorizeSubscriptionResponse,
  RequestSubscriptionBody,
  RequestSubscriptionResponse,
  RevokeSubscriptionBody
} from '@iota/is-shared-modules/lib/models/types/request-response-bodies';
export {
  Subscription as SubscriptionInternal,
  SubscriptionUpdate
} from '@iota/is-shared-modules/lib/models/types/subscription';
export { AccessRights } from '@iota/is-shared-modules/lib/models/schemas/subscription';

// Export identity types
export {
  IdentityInternal,
  IdentityJson,
  VerifiableCredentialJson
} from '@iota/is-shared-modules/lib/models/types/identity';
export { RevokeVerificationBody } from '@iota/is-shared-modules/lib/models/types/request-response-bodies';
export { User, UserType } from '@iota/is-shared-modules/lib/models/types/user';
export {
  CredentialTypes,
  VerifiableCredentialInternal
} from '@iota/is-shared-modules/lib/models/types/verification';
export { IdentityDocumentJson } from '@iota/is-shared-modules/src/models/types/identity';
