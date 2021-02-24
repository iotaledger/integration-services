import { NextFunction, Request, Response } from 'express';
import { ChannelInfoDto, ChannelInfo, ChannelInfoSearch } from '../../models/data/channel-info';
import * as service from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

export const searchChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelInfoSearch = getChannelInfoSearch(req);
    const channelInfos = await service.searchChannelInfo(channelInfoSearch);
    const channelInfosDto = channelInfos.map((c) => getChannelInfoDto(c));
    res.send(channelInfosDto);
  } catch (error) {
    next(error);
  }
};

export const getChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelAddress = _.get(req, 'params.channelAddress');

    if (_.isEmpty(channelAddress)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const channelInfo = await service.getChannelInfo(channelAddress);
    const channelInfoDto = getChannelInfoDto(channelInfo);
    res.send(channelInfoDto);
  } catch (error) {
    next(error);
  }
};

export const addChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelInfo = getChannelInfoFromBody(req.body);

    if (channelInfo == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const result = await service.addChannelInfo(channelInfo);

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

export const updateChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelInfo = getChannelInfoFromBody(req.body);

    if (channelInfo == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const result = await service.updateChannelInfo(channelInfo);

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

export const deleteChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelAddress = _.get(req, 'params.channelAddress');
    if (_.isEmpty(channelAddress)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    await service.deleteChannelInfo(channelAddress);
    res.sendStatus(StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

export const getChannelInfoFromBody = (dto: ChannelInfoDto): ChannelInfo | null => {
  if (dto == null || _.isEmpty(dto.channelAddress) || _.isEmpty(dto.topics) || _.isEmpty(dto.authorId)) {
    throw new Error('Error when parsing the body: channelAddress and author must be provided!');
  }

  const channelInfo: ChannelInfo = {
    created: dto.created ? getDateFromString(dto.created) : null,
    authorId: dto.authorId,
    subscriberIds: dto.subscriberIds || [],
    topics: dto.topics,
    channelAddress: dto.channelAddress,
    latestMessage: dto.latestMessage && getDateFromString(dto.created)
  };

  return channelInfo;
};

export const getChannelInfoDto = (c: ChannelInfo): ChannelInfoDto | null => {
  if (c == null || _.isEmpty(c.channelAddress) || _.isEmpty(c.authorId)) {
    throw new Error('Error when parsing the channelInfo, no channelAddress and/or author was found!');
  }

  const channelInfo: ChannelInfoDto = {
    created: getDateStringFromDate(c.created),
    authorId: c.authorId,
    subscriberIds: c.subscriberIds || [],
    topics: c.topics,
    latestMessage: c.latestMessage && getDateStringFromDate(c.latestMessage),
    channelAddress: c.channelAddress
  };
  return channelInfo;
};

const getChannelInfoSearch = (req: Request): ChannelInfoSearch => {
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
