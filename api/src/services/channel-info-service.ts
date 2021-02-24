import { ChannelInfo, ChannelInfoSearch } from '../models/data/channel-info';
import * as ChannelInfoDb from '../database/channel-info';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { UserService } from './user-service';

export class ChannelInfoService {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  async getChannelInfo(channelAddress: string): Promise<ChannelInfo> {
    return ChannelInfoDb.getChannelInfo(channelAddress);
  }

  async searchChannelInfo(channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfo[]> {
    if (channelInfoSearch.author && !channelInfoSearch.authorId) {
      const authorId = await (await this.userService.getUser(channelInfoSearch.author))?.userId;
      const c = {
        ...channelInfoSearch,
        authorId
      };
      return ChannelInfoDb.searchChannelInfo(c);
    }
    return ChannelInfoDb.searchChannelInfo(channelInfoSearch);
  }

  async addChannelInfo(channelInfo: ChannelInfo): Promise<InsertOneWriteOpResult<WithId<unknown>>> {
    return ChannelInfoDb.addChannelInfo(channelInfo);
  }

  async updateChannelInfo(channelInfo: ChannelInfo): Promise<UpdateWriteOpResult> {
    return ChannelInfoDb.updateChannelInfo(channelInfo);
  }

  async deleteChannelInfo(channelAddress: string): Promise<DeleteWriteOpResultObject> {
    return ChannelInfoDb.deleteChannelInfo(channelAddress);
  }
}
