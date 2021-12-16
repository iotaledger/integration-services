import { ChannelData } from '../models/types/channel-data';
import { ChannelInfo, ChannelInfoSearch } from '../models/types/channel-info';
import { ClientConfig } from '../models/clientConfig';
import {
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
} from '../models/types/request-response-bodies';
import {
  Subscription as SubscriptionInternal,
  SubscriptionUpdate
} from '../models/types/subscription';
import { BaseClient } from './base';

export class ChannelClient extends BaseClient {
  constructor(config: ClientConfig = {}) {
    super(config);
  }

  /**
   * Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.
   * @param channelData
   * @returns
   */
  async create(data: CreateChannelBody): Promise<CreateChannelResponse> {
    return await this.post('channels/create', data, this.jwtToken);
  }

  /**
   * Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.
   * @param channelAddress
   * @param data
   * @returns
   */
  async write(address: string, data: AddChannelLogBody): Promise<ChannelData> {
    return await this.post(`channels/logs/${address}`, data, this.jwtToken);
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
    const channelData: any[] = await this.get(
      `channels/logs/${channelAddress}`,
      { limit, index, param3, ...param1, ...param2 },
      this.jwtToken
    );
    // Temporary fix to replace null values with undefined
    // TODO: fix this in backend
    return channelData.map((data) => {
      Object.keys(data?.log).forEach((key) => {
        if (data?.log[key] === null) {
          data.log[key] = undefined;
        }
      });
      return data ;
    }) as any[];
  }

  /**
   * Get all data of a channel using a shared key (in case of encrypted channels). Mainly used from auditors to evaluate a log stream.
   * @param channelAddress
   * @param presharedKey
   * @returns
   */
  async readHistory(channelAddress: string, presharedKey: string): Promise<ChannelData[]> {
    return await this.get(`channels/history/${channelAddress}`, {
      'preshared-key': presharedKey
    });
  }

  /**
   * Validates channel data by comparing the log of each link with the data on the tangle.
   * @param address
   * @param data
   * @returns
   */
  async validate(address: string, data: ValidateBody): Promise<ValidateResponse> {
    return await this.post(`channels/validate/${address}`, data, this.jwtToken);
  }

  /**
   * The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.
   * @param address
   * @param data
   * @returns
   */
  async reimport(address: string, data: ReimportBody): Promise<null> {
    return await this.post(`re-import/${address}`, data, this.jwtToken);
  }

  /**
   * Search for a channel. A client can search for a channel which it is interested in.
   * @param author
   * @param topicType
   * @param topicSource
   * @param created
   * @param latestMessage
   * @param limit
   * @param index
   * @returns
   */
  async search(searchCriteria: ChannelInfoSearch): Promise<ChannelInfo[]> {
    const { author, authorId, topicType, topicSource, created, latestMessage, limit, index } =
      searchCriteria;
    const param1 = topicType !== undefined ? { 'topic-type': topicType } : {};
    const param2 = topicSource !== undefined ? { 'topic-source': topicSource } : {};
    const param3 = latestMessage !== undefined ? { 'latest-message': latestMessage } : {};
    const param4 = authorId !== undefined ? { 'author-id': authorId } : {};
    return await this.get(
      'channel-info/search',
      {
        author,
        ...param1,
        ...param2,
        created,
        ...param3,
        ...param4,
        limit,
        index
      },
      this.jwtToken
    );
  }

  /**
   * Get information about a channel with address channel-address.
   * @param address
   * @returns
   */
  async info(address: string): Promise<ChannelInfo> {
    return await this.get(`channel-info/channel/${address}`);
  }

  /**
   * Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.
   * @param channel
   * @returns
   */
  async add(channel: ChannelInfo): Promise<null> {
    return await this.post('channel-info/channel', channel, this.jwtToken);
  }

  /**
   * Update channel information. The author of a channel can update topics of a channel.
   * @param channel
   * @returns
   */
  async update(channel: ChannelInfo): Promise<null> {
    return await this.put('channel-info/channel', channel, this.jwtToken);
  }

  /**
   * Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!
   * @param address
   * @returns
   */
  async remove(address: string): Promise<null> {
    return await this.delete(`channel-info/channel/${address}`, {}, this.jwtToken);
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
  ): Promise<SubscriptionInternal[]> {
    const params = isAuthorized !== undefined ? { 'is-authorized': isAuthorized } : {};
    return await this.get(`subscriptions/${channelAddress}`, params, this.jwtToken);
  }

  /**
   * Get a subscription of a channel by identity id.
   * @param channelAddress
   * @param id
   * @returns
   */
  async findSubscription(
    channelAddress: string,
    id: string
  ): Promise<SubscriptionInternal> {
    return await this.get(`subscriptions/${channelAddress}/${id}`, {}, this.jwtToken);
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
    return await this.post(`subscriptions/request/${channelAddress}`, options, this.jwtToken);
  }

  /**
   * Authorize a subscription to a channel with address channel-address. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the Ecommerce-SSI Bridge).
   * @param channelAddress
   * @param authorization
   * @returns
   */
  async authorizeSubscription(
    channelAddress: string,
    subscriptionIdentifier: AuthorizeSubscriptionBody
  ): Promise<AuthorizeSubscriptionResponse> {
    return await this.post(
      `subscriptions/authorize/${channelAddress}`,
      subscriptionIdentifier,
      this.jwtToken
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
      `subscriptions/revoke/${channelAddress}`,
      subscriptionIdentifier,
      this.jwtToken
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
    subscription: SubscriptionInternal
  ): Promise<SubscriptionInternal> {
    return await this.post(
      `subscriptions/${channelAddress}/${id}`,
      subscription,
      this.jwtToken
    );
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
      `subscriptions/${channelAddress}/${id}`,
      updatedSubscription,
      this.jwtToken
    );
  }

  /**
   * Deletes an existing subscription.
   * @param channelAddress
   * @param id
   * @returns
   */
  async removeSubscription(channelAddress: string, id: string): Promise<null> {
    return await this.delete(`subscriptions/${channelAddress}/${id}`, {}, this.jwtToken);
  }
}
