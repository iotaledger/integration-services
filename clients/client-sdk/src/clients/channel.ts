import {
  ChannelData,
  ChannelInfo,
  ChannelInfoSearch,
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
  RevokeSubscriptionBody,
  Subscription,
  SubscriptionUpdate,
  ChannelType
} from '@iota/is-shared-modules';
import { createAsymSharedKey } from '@iota/is-shared-modules/node/utils/encryption';
import { ClientConfig } from '../models/clientConfig';
import { BaseClient } from './base';

export class ChannelClient extends BaseClient {
  private baseUrl: string;

  constructor(config: ClientConfig) {
    super(config);
    this.baseUrl = this.useGatewayUrl ? this.isGatewayUrl!! : this.auditTrailUrl!!;
    this.baseUrl = this.baseUrl + `/api/${config.apiVersionAuditTrail}`;
  }

  /**
   * Create an asymmetric shared key from the privateKey for encryption of the identity and the peerPublicKey of the channel.
   * @param privateKey
   * @param peerPublicKey
   * @returns
   */
  getAsymSharedKey(privateKey: string, peerPublicKey: string): string {
    return createAsymSharedKey(privateKey, peerPublicKey);
  }

  /**
   * Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.
   * @param channelData
   * @returns
   */
  async create(data: CreateChannelBody): Promise<CreateChannelResponse> {
    return await this.post(`${this.baseUrl}/channels/create`, data);
  }

  /**
   * Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.
   * @param channelAddress
   * @param data
   * @returns
   */
  async write(address: string, data: AddChannelLogBody): Promise<ChannelData> {
    return await this.post(`${this.baseUrl}/channels/logs/${address}`, data);
  }

  /**
   * Get data from the channel with address channel address. The first possible message a subscriber can receive is the time the subscription got approved all messages before are not received. Read permission is mandatory.
   * @param channelAddress
   * @param limit
   * @param index
   * @param asc
   * @param startDate
   * @param endDate
   * @returns
   */
  async read(
    channelAddress: string,
    channelOptions?: {
      limit?: number;
      index?: number;
      asc?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ChannelData[]> {
    const { limit, index, asc, startDate, endDate } = channelOptions || {};
    const param1 = startDate !== undefined ? { 'start-date': startDate } : {};
    const param2 = endDate !== undefined ? { 'end-date': endDate } : {};
    const param3 = asc !== undefined ? { asc } : { asc: true };
    const channelData: any[] = await this.get(`${this.baseUrl}/channels/logs/${channelAddress}`, {
      limit,
      index,
      ...param1,
      ...param2,
      ...param3
    });
    // Temporary fix to replace null values with undefined
    // TODO: fix this in backend
    return channelData.map((data) => {
      Object.keys(data?.log).forEach((key) => {
        if (data?.log[key] === null) {
          data.log[key] = undefined;
        }
      });
      return data;
    }) as any[];
  }

  /**
   * Get all data of a channel using a shared key (in case of encrypted channels). Mainly used from auditors to evaluate a log stream.
   * @param channelAddress
   * @param presharedKey
   * @param type
   * @returns
   */
  async readHistory(
    channelAddress: string,
    presharedKey: string,
    type?: ChannelType
  ): Promise<ChannelData[]> {
    return await this.get(`${this.baseUrl}/channels/history/${channelAddress}`, {
      'preshared-key': presharedKey,
      type: type
    });
  }

  /**
   * Validates channel data by comparing the log of each link with the data on the tangle.
   * @param address
   * @param data
   * @returns
   */
  async validate(address: string, data: ValidateBody): Promise<ValidateResponse> {
    return await this.post(`${this.baseUrl}/channels/validate/${address}`, data);
  }

  /**
   * The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.
   * @param address
   * @param data
   * @returns
   */
  async reimport(address: string, data: ReimportBody): Promise<null> {
    return await this.post(`${this.baseUrl}/re-import/${address}`, data);
  }

  /**
   * Search for a channel. A client can search for a channel which it is interested in.
   * @param authorId
   * @param subscriberId,
   * @param requestedSubscriptionId
   * @param topicType
   * @param topicSource
   * @param created
   * @param latestMessage
   * @param limit
   * @param index
   * @param hidden
   * @returns
   */
  async search(searchCriteria: ChannelInfoSearch): Promise<ChannelInfo[]> {
    const {
      name,
      authorId,
      subscriberId,
      requestedSubscriptionId,
      topicType,
      topicSource,
      created,
      latestMessage,
      limit,
      index,
      ascending,
      hidden
    } = searchCriteria;
    const topicTypeParam = topicType !== undefined ? { 'topic-type': topicType } : {};
    const topicSourceParam = topicSource !== undefined ? { 'topic-source': topicSource } : {};
    const latestMessageParam =
      latestMessage !== undefined ? { 'latest-message': latestMessage } : {};
    const authorIdParam = authorId !== undefined ? { 'author-id': authorId } : {};
    const subscriberIdParam = subscriberId !== undefined ? { 'subscriber-id': subscriberId } : {};
    const requestedSubscriptionIdParam =
      requestedSubscriptionId !== undefined
        ? { 'requested-subscription-id': requestedSubscriptionId }
        : {};
    const ascendingParam = ascending !== undefined ? { asc: ascending } : {};
    return await this.get(`${this.baseUrl}/channel-info/search`, {
      name,
      ...topicTypeParam,
      ...topicSourceParam,
      created,
      ...latestMessageParam,
      ...authorIdParam,
      ...subscriberIdParam,
      ...requestedSubscriptionIdParam,
      ...ascendingParam,
      limit,
      index,
      hidden
    });
  }

  /**
   * Get information about a channel with address channel-address.
   * @param address
   * @returns
   */
  async info(address: string): Promise<ChannelInfo> {
    return await this.get(`${this.baseUrl}/channel-info/channel/${address}`);
  }

  /**
   * Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.
   * @param channel
   * @returns
   */
  async add(channel: ChannelInfo): Promise<null> {
    return await this.post(`${this.baseUrl}/channel-info/channel`, channel);
  }

  /**
   * Update channel information. The author of a channel can update topics of a channel.
   * @param channel
   * @returns
   */
  async update(channel: ChannelInfo): Promise<null> {
    return await this.put(`${this.baseUrl}/channel-info/channel`, channel);
  }

  /**
   * Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!
   * @param address
   * @returns
   */
  async remove(address: string): Promise<null> {
    return await this.delete(`${this.baseUrl}/channel-info/channel/${address}`, {});
  }

  /**
   * Get all subscriptions of a channel. Use the is-authorized query parameter to filter for authorized subscriptions.
   * @param channelAddress
   * @param isAuthorized
   * @returns
   */
  async findAllSubscriptions(
    channelAddress: string,
    isAuthorized?: boolean
  ): Promise<Subscription[]> {
    const params = isAuthorized !== undefined ? { 'is-authorized': isAuthorized } : {};
    return await this.get(`${this.baseUrl}/subscriptions/${channelAddress}`, params);
  }

  /**
   * Get a subscription of a channel by identity id.
   * @param channelAddress
   * @param id
   * @returns
   */
  async findSubscription(channelAddress: string, id: string): Promise<Subscription> {
    return await this.get(`${this.baseUrl}/subscriptions/${channelAddress}/${id}`, {});
  }

  /**
   * Request subscription to a channel with address channel-address. A client can request a subscription to a channel which it then is able to read/write from.
   * @param channelAddress
   * @param options
   * @returns
   */
  async requestSubscription(
    channelAddress: string,
    options?: RequestSubscriptionBody
  ): Promise<RequestSubscriptionResponse> {
    return await this.post(`${this.baseUrl}/subscriptions/request/${channelAddress}`, options);
  }

  /**
   * Authorize a subscription to a channel with DID or subscription link. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the SSI Bridge).
   * @param channelAddress
   * @param subscriptionIdentifier
   * @returns keyloadLink
   */
  async authorizeSubscription(
    channelAddress: string,
    subscriptionIdentifier: AuthorizeSubscriptionBody
  ): Promise<AuthorizeSubscriptionResponse> {
    return await this.post(
      `${this.baseUrl}/subscriptions/authorize/${channelAddress}`,
      subscriptionIdentifier
    );
  }

  /**
   * Revoke subscription to a channel. Only the author of a channel can revoke a subscription from a channel.
   * @param channelAddress
   * @param subscriptionIdentifier
   * @returns
   */
  async revokeSubscription(
    channelAddress: string,
    subscriptionIdentifier: RevokeSubscriptionBody
  ): Promise<null> {
    return await this.post(
      `${this.baseUrl}/subscriptions/revoke/${channelAddress}`,
      subscriptionIdentifier
    );
  }

  /**
   * Adds an existing subscription (e.g. the subscription was not created with the api but locally.)
   * @param channelAddress
   * @param id
   * @param subscription
   * @returns
   */
  async addSubscription(
    channelAddress: string,
    id: string,
    subscription: Subscription
  ): Promise<Subscription> {
    return await this.post(`${this.baseUrl}/subscriptions/${channelAddress}/${id}`, subscription);
  }

  /**
   * Updates an existing subscription.
   * @param channelAddress
   * @param id
   * @param updatedSubscription
   * @returns
   */
  async updateSubscription(
    channelAddress: string,
    id: string,
    updatedSubscription: SubscriptionUpdate
  ): Promise<null> {
    return await this.put(
      `${this.baseUrl}/subscriptions/${channelAddress}/${id}`,
      updatedSubscription
    );
  }

  /**
   * Deletes an existing subscription.
   * @param channelAddress
   * @param id
   * @returns
   */
  async removeSubscription(channelAddress: string, id: string): Promise<null> {
    return await this.delete(`${this.baseUrl}/subscriptions/${channelAddress}/${id}`, {});
  }
}
