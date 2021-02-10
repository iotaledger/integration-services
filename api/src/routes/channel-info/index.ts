import { NextFunction, Request, Response } from 'express';
import { ChannelInfoDto, ChannelInfo } from '../../models/data/channel-info';
import * as service from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

export const getChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelAddress = req.params['channelAddress'];

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

    if (result.result.n === 0) {
      next(new Error('Could not add channel info'));
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

    if (result.result.n === 0) {
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
  const channelAddress = req.params['channelAddress'];
  try {
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
  if (dto == null) {
    return null;
  }
  const channelInfo: ChannelInfo = {
    created: dto.created ? getDateFromString(dto.created) : null,
    author: dto.author,
    subscribers: dto.subscribers || [],
    topics: dto.topics,
    channelAddress: dto.channelAddress,
    latestMessage: dto.latestMessage && getDateFromString(dto.created)
  };

  if (_.isEmpty(channelInfo.channelAddress) || _.isEmpty(channelInfo.topics) || _.isEmpty(channelInfo.author)) {
    return null;
  }
  return channelInfo;
};

export const getChannelInfoDto = (c: ChannelInfo): ChannelInfoDto | null => {
  if (c == null || _.isEmpty(c.channelAddress) || _.isEmpty(c.topics) || _.isEmpty(c.author) || c.created == null) {
    return null;
  }

  const channelInfo: ChannelInfoDto = {
    created: getDateStringFromDate(c.created),
    author: c.author,
    subscribers: c.subscribers || [],
    topics: c.topics,
    latestMessage: c.latestMessage && getDateStringFromDate(c.latestMessage),
    channelAddress: c.channelAddress
  };
  return channelInfo;
};
