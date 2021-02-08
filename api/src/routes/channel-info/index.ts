import { Request, Response } from 'express';
import { ChannelInfoDto, ChannelInfo } from '../../models/data/channel-info';
import * as service from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

export const getChannelInfo = async (req: Request, res: Response) => {
  const channelAddress = req.params['channelAddress'];
  console.log('ch', channelAddress);

  if (_.isElement(channelAddress)) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const channelInfo = await service.getChannelInfo(channelAddress);
  const dto = getChannelInfoDto(channelInfo[0]);
  res.send(dto);
};

export const addChannelInfo = async (req: Request, res: Response) => {
  const channelInfo = getChannelInfoFromBody(req.body);

  if (channelInfo == null) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }
  await service.addChannelInfo(channelInfo);

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

export const deleteChannelInfo = async (req: Request, res: Response) => {
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

export const getChannelInfoDto = (c: ChannelInfo): ChannelInfoDto | null => {
  if (c == null || _.isEmpty(c.channelAddress) || _.isEmpty(c.topics) || _.isEmpty(c.author) || c.created == null) {
    return null;
  }
  console.log('c.latestMessage?.toDateString()', c.latestMessage?.toDateString());

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
