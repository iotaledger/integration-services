import { ChannelInfo, ChannelInfoPersistence, ChannelInfoSearch } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { UserService } from './user-service';
import { getDateFromString, getDateStringFromDate } from '../utils/date';
import isEmpty from 'lodash/isEmpty';

export class ChannelInfoService {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  getChannelInfo = async (channelAddress: string): Promise<ChannelInfo> => {
    const channelInfoPersistence = await ChannelInfoDb.getChannelInfo(channelAddress);
    return this.getChannelInfoObject(channelInfoPersistence);
  };

  searchChannelInfo = async (channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfo[]> => {
    let channelInfoPersistence: ChannelInfoPersistence[] = [];

    if (channelInfoSearch.author && !channelInfoSearch.authorId) {
      const authorId = (await this.userService.getUser(channelInfoSearch.author))?.userId;

      if (!authorId) {
        console.error(`No user id found for: ${channelInfoSearch.author}`);
      }
      const search = {
        ...channelInfoSearch,
        authorId
      };
      channelInfoPersistence = await ChannelInfoDb.searchChannelInfo(search);
    } else {
      channelInfoPersistence = await ChannelInfoDb.searchChannelInfo(channelInfoSearch);
    }
    return channelInfoPersistence.map((c) => this.getChannelInfoObject(c));
  };

  addChannelInfo = async (channelInfo: ChannelInfo): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
    const channelInfoPersistence = this.getChannelInfoPersistence(channelInfo);
    return ChannelInfoDb.addChannelInfo(channelInfoPersistence);
  };

  updateChannelInfo = async (channelInfo: ChannelInfo): Promise<UpdateWriteOpResult> => {
    const channelInfoPersistence = this.getChannelInfoPersistence(channelInfo);
    return ChannelInfoDb.updateChannelInfo(channelInfoPersistence);
  };

  deleteChannelInfo = async (channelAddress: string): Promise<DeleteWriteOpResultObject> => {
    return ChannelInfoDb.deleteChannelInfo(channelAddress);
  };

  getChannelInfoPersistence = (ci: ChannelInfo): ChannelInfoPersistence | null => {
    if (ci == null || isEmpty(ci.channelAddress) || isEmpty(ci.topics) || isEmpty(ci.authorId)) {
      throw new Error('Error when parsing the body: channelAddress and author must be provided!');
    }

    const channelInfoPersistence: ChannelInfoPersistence = {
      created: ci.created ? getDateFromString(ci.created) : null,
      authorId: ci.authorId,
      subscriberIds: ci.subscriberIds || [],
      topics: ci.topics,
      channelAddress: ci.channelAddress,
      latestMessage: ci.latestMessage && getDateFromString(ci.created)
    };

    return channelInfoPersistence;
  };

  getChannelInfoObject = (cip: ChannelInfoPersistence): ChannelInfo | null => {
    if (cip == null || isEmpty(cip.channelAddress) || isEmpty(cip.authorId)) {
      throw new Error('Error when parsing the channelInfo, no channelAddress and/or author was found!');
    }

    const channelInfo: ChannelInfo = {
      created: getDateStringFromDate(cip.created),
      authorId: cip.authorId,
      subscriberIds: cip.subscriberIds || [],
      topics: cip.topics,
      latestMessage: cip.latestMessage && getDateStringFromDate(cip.latestMessage),
      channelAddress: cip.channelAddress
    };
    return channelInfo;
  };
}
