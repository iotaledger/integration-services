import { Request, Response } from 'express';
import { ChannelInfoDto, ChannelInfo } from '../../models/data/channel-info';
import * as service from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

export const getChannelInfo = async (req: Request, res: Response) => {
  const channelAddress = req.params['channelAddress'];
  console.log('ch', channelAddress);

  if (_.isElement(channelAddress)) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const info = await service.getChannelInfo(channelAddress);
  res.send(info);
};

export const addChannelInfo = (req: Request, res: Response): void => {
  const channelInfo = getChannelInfoFromBody(req.body);

  if (channelInfo == null) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  service.addChannelInfo(channelInfo);
  res.sendStatus(StatusCodes.CREATED);
};

export const updateChannelInfo = (req: Request, res: Response): void => {
  const channelInfo = getChannelInfoFromBody(req.body);

  if (channelInfo == null) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  service.updateChannelInfo(channelInfo);
  res.sendStatus(StatusCodes.OK);
};

export const deleteChannelInfo = (req: Request, res: Response): void => {
  const channelAddress = req.params['channelAddress'];

  if (_.isElement(channelAddress)) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  service.deleteChannelInfo(channelAddress);
  res.sendStatus(StatusCodes.OK);
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
