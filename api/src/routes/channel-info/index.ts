import { NextFunction, Request, Response } from 'express';
import { ChannelInfo, ChannelInfoPersistence, ChannelInfoSearch } from '../../models/data/channel-info';
import { ChannelInfoService } from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

export class ChannelInfoRoutes {
  private readonly channelInfoService: ChannelInfoService;
  constructor(channelInfoService: ChannelInfoService) {
    this.channelInfoService = channelInfoService;
  }

  searchChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelInfoSearch = this.getChannelInfoSearch(req);
      const channelInfoPersistence = await this.channelInfoService.searchChannelInfo(channelInfoSearch);
      const channelInfos = channelInfoPersistence.map((c) => this.getChannelInfoObject(c));
      res.send(channelInfos);
    } catch (error) {
      next(error);
    }
  };

  getChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelAddress = _.get(req, 'params.channelAddress');

      if (_.isEmpty(channelAddress)) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      const channelInfoPersistence = await this.channelInfoService.getChannelInfo(channelAddress);
      const channelInfo = this.getChannelInfoObject(channelInfoPersistence);
      res.send(channelInfo);
    } catch (error) {
      next(error);
    }
  };

  addChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelInfo = this.getChannelInfoPersistence(req.body);

      if (channelInfo == null) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      const result = await this.channelInfoService.addChannelInfo(channelInfo);

      if (!result?.result?.n) {
        res.status(StatusCodes.NOT_FOUND);
        res.send({ error: 'Could not add channel info' });
        return;
      }

      res.sendStatus(StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelInfo = this.getChannelInfoPersistence(req.body);

      if (channelInfo == null) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      const result = await this.channelInfoService.updateChannelInfo(channelInfo);

      if (!result?.result?.n) {
        res.status(StatusCodes.NOT_FOUND);
        res.send({ error: 'No channel info found to update!' });
        return;
      }

      res.sendStatus(StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  };

  deleteChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channelAddress = _.get(req, 'params.channelAddress');
      if (_.isEmpty(channelAddress)) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      await this.channelInfoService.deleteChannelInfo(channelAddress);
      res.sendStatus(StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  };

  getChannelInfoPersistence = (ci: ChannelInfo): ChannelInfoPersistence | null => {
    if (ci == null || _.isEmpty(ci.channelAddress) || _.isEmpty(ci.topics) || _.isEmpty(ci.authorId)) {
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
    if (cip == null || _.isEmpty(cip.channelAddress) || _.isEmpty(cip.authorId)) {
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

  getChannelInfoSearch = (req: Request): ChannelInfoSearch => {
    const authorId = <string>req.query['author-id'] || undefined;
    const author = <string>req.query.author || undefined;
    const topicType = <string>req.query['topic-type'] || undefined;
    const topicSource = <string>req.query['topic-source'] || undefined;
    const created = <string>req.query.created || undefined;
    const latestMessage = <string>req.query['latest-message'] || undefined;
    const limitParam = parseInt(<string>req.query.limit, 10);
    const indexParam = parseInt(<string>req.query.index, 10);
    const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
    const index = isNaN(indexParam) ? undefined : indexParam;

    return {
      author,
      authorId,
      topicType,
      topicSource,
      limit,
      index,
      created: getDateFromString(created),
      latestMessage: getDateFromString(latestMessage)
    };
  };
}
