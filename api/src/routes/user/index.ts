import { NextFunction, Request, Response } from 'express';
import { UserDto, User } from '../../models/data/user';
import * as service from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

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

    if (channelInfo == null || !isValidAddBody(channelInfo)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }
    const result = await service.addUser(channelInfo);

    if (result.result.n === 0) {
      res.status(StatusCodes.NOT_FOUND);
      res.send({ error: 'No channel info found to update!' });
      return;
    }

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

    const result = await service.updateUser(channelInfo);

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

const isValidAddBody = (user: User): boolean => {
  return !_.isEmpty(user.userId) && !_.isEmpty(user.username) && !_.isEmpty(user.classification);
};

const getChannelInfoFromBody = (dto: UserDto): User | null => {
  if (dto == null || _.isEmpty(dto.userId)) {
    return null;
  }
  const {
    firstName,
    lastName,
    subscribedChannels,
    userId,
    username,
    verification,
    organization,
    registrationDate,
    classification,
    description
  } = dto;

  const user: User = {
    userId,
    username,
    classification,
    subscribedChannels,
    firstName,
    lastName,
    description,
    organization,
    registrationDate: registrationDate && getDateFromString(registrationDate),
    verification: verification && {
      verificationDate: verification.verificationDate && getDateFromString(verification.verificationDate),
      verified: verification.verified,
      verificationIssuer: verification.verificationIssuer
    }
  };

  if (_.isEmpty(user.userId)) {
    return null;
  }
  return user;
};

const getChannelInfoDto = (user: User): UserDto | null => {
  if (user == null || _.isEmpty(user.userId) || _.isEmpty(user.username)) {
    return null;
  }

  const {
    firstName,
    username,
    userId,
    subscribedChannels,
    organization,
    lastName,
    registrationDate,
    verification,
    classification,
    description
  } = user;

  const userDto: UserDto = {
    userId,
    username,
    classification,
    subscribedChannels,
    firstName,
    lastName,
    description,
    registrationDate: getDateStringFromDate(registrationDate),
    verification: {
      verified: verification.verified,
      verificationDate: getDateStringFromDate(verification.verificationDate),
      verificationIssuer: verification.verificationIssuer
    },
    organization
  };
  return userDto;
};
