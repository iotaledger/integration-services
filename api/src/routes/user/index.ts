import { NextFunction, Request, Response } from 'express';
import { UserDto, User } from '../../models/data/user';
import * as service from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString } from '../../utils/date';

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['userId'];

    if (_.isEmpty(userId)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const channelInfo = await service.getUser(userId);
    const channelInfoDto = getChannelInfoDto(channelInfo);
    res.send(channelInfoDto);
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelInfo = getChannelInfoFromBody(req.body);

    if (channelInfo == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }
    await service.addUser(channelInfo);

    res.sendStatus(StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelInfo = getChannelInfoFromBody(req.body);

    if (channelInfo == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    await service.updateUser(channelInfo);
    res.sendStatus(StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.params['userId'];
  try {
    if (_.isEmpty(userId)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    await service.deleteUser(userId);
    res.sendStatus(StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

// TODO
export const getChannelInfoFromBody = (dto: UserDto): User | null => {
  if (dto == null || _.isEmpty(dto.userId) || _.isEmpty(dto.username)) {
    throw new Error('The following fields are required: userId, username');
  }
  const { firstName, lastName, subscribedChannels, userId, username, verification, organization, registrationDate } = dto;
  const user: User = {
    firstName,
    lastName,
    registrationDate: dto.registrationDate && getDateFromString(dto.registrationDate),
    organization,
    subscribedChannels,
    verification: {
      verificationDate: dto.verification.verificationDate && getDateFromString(dto.verification.verificationDate),
      verified: dto.verification.verified,
      verificationIssuer: dto.verification.verificationIssuer
    },
    userId,
    username
  };

  if (_.isEmpty(user.userId)) {
    return null;
  }
  return user;
};

export const getChannelInfoDto = (user: User): UserDto | null => {
  if (user == null) {
    return null;
  }

  // TODO
  const userDto: any = {
    // created: moment(c.created.toUTCString()).format('DD-MM-YYYY'),
    // latestMessage: c.latestMessage && moment(c.latestMessage.toUTCString()).format('DD-MM-YYYY'),
  };
  return userDto;
};
