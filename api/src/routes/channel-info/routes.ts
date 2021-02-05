import { Request, Response } from 'express';
import { ChannelInfoDto, ChannelInfo } from '../../models/data/channel-info';
import * as service from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

export const getChannelInfo = (req: Request, res: Response): void => {
  console.log('Get user');

  try {
    const info = service.getChannelInfo();
    res.send(info);
  } catch (e) {
    throw e;
  }
};

export const addChannelInfo = (req: Request, res: Response): void => {
  const channelInfo = getChannelInfoFromBody(req.body);

  if (channelInfo == null) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  try {
    service.addChannelInfo(channelInfo);
    res.sendStatus(StatusCodes.CREATED);
  } catch (e) {
    throw e;
  }
};

export const updateChannelInfo = (req: Request, res: Response): void => {
  const channelInfo = getChannelInfoFromBody(req.body);

  if (channelInfo == null) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  try {
    service.updateChannelInfo(channelInfo);
    res.sendStatus(StatusCodes.OK);
  } catch (e) {
    throw e;
  }
};

export const deleteChannelInfo = (req: Request, res: Response): void => {
  const channelAddress = req.params['channelAddress'];

  if (_.isElement(channelAddress)) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  try {
    service.deleteChannelInfo(channelAddress);
    res.sendStatus(StatusCodes.OK);
  } catch (e) {
    throw e;
  }
};

const getChannelInfoFromBody = (channelInfoDto: ChannelInfoDto): ChannelInfo | null => {
  const channelInfo: ChannelInfo = {
    created: new Date(),
    author: channelInfoDto.author,
    subscribers: channelInfoDto.subscribers,
    topics: channelInfoDto.topics,
    channelAddress: ''
  };
  if (
    _.isEmpty(channelInfo.channelAddress) ||
    _.isEmpty(channelInfo.created) ||
    _.isEmpty(channelInfo.latestMessage) ||
    _.isEmpty(channelInfo.topics) ||
    _.isEmpty(channelInfo.author)
  ) {
    return null;
  }
  return channelInfo;
};
