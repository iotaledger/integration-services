import { ChannelData } from '../models/types/channel-data';
import { ChannelInfo } from '../models/types/channel-info';
import { ClientConfig } from '../models/types/clientConfig';
import {
  AddChannelLogBody,
  CreateChannelBody,
  CreateChannelResponse,
  ReimportBody,
  ValidateBody,
  ValidateResponse,
} from '../models/types/request-response-bodies';
import { Base } from './base';

export class Channel extends Base {
  constructor(config: ClientConfig) {
    super(config);
  }

  /**
   * Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.
   * @param channelData
   * @returns
   */
  async create(channelData: CreateChannelBody): Promise<CreateChannelResponse> {
    return await this.post('channels/create', channelData, Base.jwtToken);
  }

  /**
   * Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.
   * @param channelAddress
   * @param data
   * @returns
   */
  async write(channelAddress: string, data: AddChannelLogBody): Promise<ChannelData> {
    return await this.post(`channels/logs/${channelAddress}`, data, Base.jwtToken);
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
    limit?: number,
    index?: number,
    asc = true,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ChannelData[]> {
    const param1 = startDate !== undefined ? { 'start-date': startDate } : {};
    const param2 = endDate !== undefined ? { 'end-date': endDate } : {};
    return await this.get(
      `channels/logs/${channelAddress}`,
      { limit, index, asc, ...param1, ...param2 },
      Base.jwtToken,
    );
  }

  /**
   * Get all data of a channel using a shared key (in case of encrypted channels). Mainly used from auditors to evaluate a log stream.
   * @param channelAddress
   * @param presharedKey
   * @returns
   */
  async readHistory(
    channelAddress: string,
    presharedKey: string,
  ): Promise<ChannelData[]> {
    return await this.get(`channels/history/${channelAddress}`, {
      'preshared-key': presharedKey,
    });
  }

  /**
   * Validates channel data by comparing the log of each link with the data on the tangle.
   * @param address
   * @param data
   * @returns
   */
  async validate(
    address: string,
    data: ValidateBody,
  ): Promise<ValidateResponse> {
    return await this.post(`channels/validate/${address}`, data, Base.jwtToken);
  }

  /**
   * The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.
   * @param address
   * @param data
   * @returns
   */
  async reimport(address: string, data: ReimportBody): Promise<null> {
    return await this.post(`re-import/${address}`, data, Base.jwtToken);
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
  async search(
    author?: string,
    topicType?: string,
    topicSource?: string,
    created?: Date,
    latestMessage?: Date,
    limit?: number,
    index?: number,
  ): Promise<ChannelInfo[]> {
    return await this.get(
      'channel-info/search',
      {
        author,
        'topic-type': topicType,
        'topic-source': topicSource,
        created,
        'latest-message': latestMessage,
        limit,
        index,
      },
      Base.jwtToken,
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
    return await this.post('channel-info/channel', channel, Base.jwtToken);
  }

  /**
   * Update channel information. The author of a channel can update topics of a channel.
   * @param channel
   * @returns
   */
  async update(channel: ChannelInfo): Promise<null> {
    return await this.put('channel-info/channel', channel, Base.jwtToken);
  }

  /**
   * Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!
   * @param address
   * @returns
   */
  async remove(address: string): Promise<null> {
    return await this.delete(
      `channel-info/channel/${address}`,
      {},
      Base.jwtToken,
    );
  }
}
