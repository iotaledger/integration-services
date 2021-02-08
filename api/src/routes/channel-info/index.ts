import { NextFunction, Request, Response } from 'express';
import { ChannelInfoDto, ChannelInfo } from '../../models/data/channel-info';
import * as service from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

export const getChannelInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channelAddress = req.params['channelAddress'];

    if (_.isElement(channelAddress)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const channelInfo = await service.getChannelInfo(channelAddress);
    const dto = getChannelInfoDto(channelInfo);
    res.send(dto);
  } catch (error) {
    next(error);
  }
};

export const addChannelInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channelInfo = getChannelInfoFromBody(req.body);

    if (channelInfo == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }
    await service.addChannelInfo(channelInfo);

    res.sendStatus(StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
};

export const updateChannelInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channelInfo = getChannelInfoFromBody(req.body);

    if (channelInfo == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    await service.updateChannelInfo(channelInfo);
    res.sendStatus(StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

export const deleteChannelInfo = async (req: Request, res: Response, next: NextFunction) => {
  const channelAddress = req.params['channelAddress'];
  try {
    if (_.isElement(channelAddress)) {
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
  const channelInfo: ChannelInfo = {
    created: new Date(),
    author: dto.author,
    subscribers: dto.subscribers || [],
    topics: dto.topics,
    channelAddress: dto.channelAddress
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
    created: moment(c.created.toUTCString()).format('DD-MM-YYYY'),
    author: c.author,
    subscribers: c.subscribers || [],
    topics: c.topics,
    latestMessage: c.latestMessage && moment(c.latestMessage.toUTCString()).format('DD-MM-YYYY'),
    channelAddress: c.channelAddress
  };
  return channelInfo;
};
