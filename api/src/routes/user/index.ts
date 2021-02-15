import { NextFunction, Request, Response } from 'express';
import { UserDto, User } from '../../models/data/user';
import * as service from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = _.get(req, 'params.userId');

    if (_.isEmpty(userId)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const user = await service.getUser(userId);
    const userDto = getUserDto(user);
    res.send(userDto);
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = getUserFromBody(req.body);

    if (user == null || !isValidAddBody(user)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }
    const result = await service.addUser(user);

    if (result.result.n === 0) {
      res.status(StatusCodes.NOT_FOUND);
      res.send({ error: 'Could not add user!' });
      return;
    }

    res.sendStatus(StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = getUserFromBody(req.body);

    if (user == null) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const result = await service.updateUser(user);

    if (result.result.n === 0) {
      res.status(StatusCodes.NOT_FOUND);
      res.send({ error: 'No user found to update!' });
      return;
    }

    res.sendStatus(StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = _.get(req, 'params.userId');
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

const getUserFromBody = (dto: UserDto): User | null => {
  if (dto == null || _.isEmpty(dto.userId)) {
    throw new Error('Error when parsing the body: userId must be provided!');
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

const getUserDto = (user: User): UserDto | null => {
  if (user == null || _.isEmpty(user.userId)) {
    throw new Error('Error when parsing the body: userId must be provided!');
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
    verification: verification && {
      verified: verification.verified,
      verificationDate: getDateStringFromDate(verification.verificationDate),
      verificationIssuer: verification.verificationIssuer
    },
    organization
  };
  return userDto;
};
