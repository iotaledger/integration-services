import {
  Subscription as SubscriptionInternal,
  SubscriptionUpdate,
} from '../models/types/subscription';
import { ClientConfig } from '../models/types/clientConfig';
import { Base } from './base';
import {
  AuthorizeSubscriptionBody,
  AuthorizeSubscriptionResponse,
  RequestSubscriptionBody,
  RequestSubscriptionResponse,
  RevokeSubscriptionBody,
} from '../models/types/request-response-bodies';

export class Subscription extends Base {
  constructor(config: ClientConfig) {
    super(config);
  }

  /**
   * Get all subscriptions of a channel. Use the is-authorized query parameter to filter for authorized subscriptions.
   * @param channelAddress
   * @param isAuthorized
   * @returns
   */
  async findAll(
    channelAddress: string,
    isAuthorized?: boolean,
  ): Promise<SubscriptionInternal[]> {
    const params =
      isAuthorized !== undefined ? { 'is-authorized': isAuthorized } : {};
    return await this.get(
      `subscriptions/${channelAddress}`,
      params,
      this.jwtToken,
    );
  }

  /**
   * Get a subscription of a channel by identity id.
   * @param channelAddress
   * @param identityId
   * @returns
   */
  async find(
    channelAddress: string,
    identityId: string,
  ): Promise<SubscriptionInternal> {
    return await this.get(
      `subscriptions/${channelAddress}/${identityId}`,
      {},
      this.jwtToken,
    );
  }

  /**
   * Request subscription to a channel with address channel-address. A client can request a subscription to a channel which it then is able to read/write from.
   * @param channelAddress
   * @param options
   * @returns
   */
  async request(
    channelAddress: string,
    options: RequestSubscriptionBody,
  ): Promise<RequestSubscriptionResponse> {
    return await this.post(
      `subscriptions/request/${channelAddress}`,
      options,
      this.jwtToken,
    );
  }

  /**
   * Authorize a subscription to a channel with address channel-address. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the Ecommerce-SSI Bridge).
   * @param channelAddress
   * @param authorization
   * @returns
   */
  async authorize(
    channelAddress: string,
    subscriptionIdentifier: AuthorizeSubscriptionBody,
  ): Promise<AuthorizeSubscriptionResponse> {
    return await this.post(
      `subscriptions/authorize/${channelAddress}`,
      subscriptionIdentifier,
      this.jwtToken,
    );
  }

  /**
   * Revoke subscription to a channel. Only the author of a channel can revoke a subscription from a channel.
   * @param channelAddress
   * @param subscriptionIdentifier
   * @returns
   */
  async revoke(
    channelAddress: string,
    subscriptionIdentifier: RevokeSubscriptionBody,
  ): Promise<null> {
    return await this.post(
      `subscriptions/revoke/${channelAddress}`,
      subscriptionIdentifier,
      this.jwtToken,
    );
  }

  /**
   * Adds an existing subscription (e.g. the subscription was not created with the api but locally.)
   * @param channelAddress
   * @param identityId
   * @param subscription
   * @returns
   */
  async add(
    channelAddress: string,
    identityId: string,
    subscription: SubscriptionInternal,
  ): Promise<SubscriptionInternal> {
    return await this.post(
      `subscriptions/${channelAddress}/${identityId}`,
      subscription,
      this.jwtToken,
    );
  }

  /**
   * Updates an existing subscription.
   * @param channelAddress
   * @param identityId
   * @param updatedSubscription
   * @returns
   */
  async update(
    channelAddress: string,
    identityId: string,
    updatedSubscription: SubscriptionUpdate,
  ): Promise<null> {
    return await this.put(
      `subscriptions/${channelAddress}/${identityId}`,
      updatedSubscription,
      this.jwtToken,
    );
  }

  /**
   * Deletes an existing subscription.
   * @param channelAddress
   * @param identityId
   * @returns
   */
  async remove(channelAddress: string, identityId: string): Promise<null> {
    return await this.delete(
      `subscriptions/${channelAddress}/${identityId}`,
      {},
      this.jwtToken,
    );
  }
}
