import { NextFunction, Request, Response } from 'express';
import { User, UserPersistence, UserSearch, UserClassification } from '../../models/data/user';
import { UserService } from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString, getDateStringFromDate } from '../../utils/date';

export class UserRoutes {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userSearch = this.getUserSearch(req);
      const usersPersistence = await this.userService.searchUsers(userSearch);

      const users = usersPersistence.map((user) => this.getUserObject(user));
      res.send(users);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = _.get(req, 'params.userId');

      if (_.isEmpty(userId)) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      const userPersistence = await this.userService.getUser(userId);
      const user = this.getUserObject(userPersistence);
      res.send(user);
    } catch (error) {
      next(error);
    }
  };

  addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = this.getUserPersistenceFromBody(req.body);
      const result = await this.userService.addUser(user);

      if (!result?.result?.n) {
        res.status(StatusCodes.NOT_FOUND);
        res.send({ error: 'Could not add user!' });
        return;
      }

      res.sendStatus(StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = this.getUserPersistenceFromBody(req.body);

      if (user == null) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      const result = await this.userService.updateUser(user);

      if (!result?.result?.n) {
        res.status(StatusCodes.NOT_FOUND);
        res.send({ error: 'No user found to update!' });
        return;
      }

      res.sendStatus(StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = _.get(req, 'params.userId');
      if (_.isEmpty(userId)) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
      }

      await this.userService.deleteUser(userId);
      res.sendStatus(StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  };

  getUserPersistenceFromBody = (user: User): UserPersistence | null => {
    if (user == null || _.isEmpty(user.userId)) {
      throw new Error('Error when parsing the body: userId must be provided!');
    }
    const {
      firstName,
      lastName,
      subscribedChannelIds,
      userId,
      username,
      verification,
      organization,
      registrationDate,
      classification,
      description
    } = user;

    if (classification !== UserClassification.human && classification !== UserClassification.device && classification !== UserClassification.api) {
      throw new Error(
        `No valid classification provided, it must be ${UserClassification.human}, ${UserClassification.device} or ${UserClassification.api}!`
      );
    }

    const userPersistence: UserPersistence = {
      userId,
      username,
      classification: classification as UserClassification,
      subscribedChannelIds,
      firstName,
      lastName,
      description,
      organization,
      registrationDate: registrationDate && getDateFromString(registrationDate),
      verification: verification && {
        verificationDate: verification.verificationDate && getDateFromString(verification.verificationDate),
        verified: verification.verified,
        verificationIssuerId: verification.verificationIssuerId
      }
    };

    return userPersistence;
  };

  getUserObject = (userPersistence: UserPersistence): User | null => {
    if (userPersistence == null || _.isEmpty(userPersistence.userId)) {
      throw new Error('Error when parsing the body: userId must be provided!');
    }

    const {
      firstName,
      username,
      userId,
      subscribedChannelIds,
      organization,
      lastName,
      registrationDate,
      verification,
      classification,
      description
    } = userPersistence;

    const user: User = {
      userId,
      username,
      classification,
      subscribedChannelIds,
      firstName,
      lastName,
      description,
      registrationDate: getDateStringFromDate(registrationDate),
      verification: verification && {
        verified: verification.verified,
        verificationDate: getDateStringFromDate(verification.verificationDate),
        verificationIssuerId: verification.verificationIssuerId
      },
      organization
    };
    return user;
  };

  getUserSearch = (req: Request): UserSearch => {
    const classification = <string>req.query.classification || undefined;
    const organization = <string>req.query.organization || undefined;
    const username = <string>req.query.username || undefined;
    const verifiedParam = <string>req.query.verified || undefined;
    const registrationDate = <string>req.query['registration-date'] || undefined;
    const verified = verifiedParam != null ? Boolean(verifiedParam) : undefined;
    let subscribedChannels: string[] = <string[]>req.query['subscribed-channel-ids'] || undefined;
    if (subscribedChannels != null && !Array.isArray(subscribedChannels)) {
      // we have a string instead of string array!
      subscribedChannels = [subscribedChannels];
    }
    const limitParam = parseInt(<string>req.query.limit, 10);
    const indexParam = parseInt(<string>req.query.index, 10);
    const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
    const index = isNaN(indexParam) ? undefined : indexParam;

    return {
      classification: <UserClassification>classification,
      index,
      limit,
      organization,
      verified,
      username,
      registrationDate: getDateFromString(registrationDate),
      subscribedChannelIds: subscribedChannels
    };
  };
}
