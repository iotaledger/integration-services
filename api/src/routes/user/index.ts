import { NextFunction, Request, Response } from 'express';
import { User, UserSearch, UserClassification } from '../../models/data/user';
import { UserService } from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString } from '../../utils/date';

export class UserRoutes {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userSearch = this.getUserSearch(req);
      const users = await this.userService.searchUsers(userSearch);
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

      const user = await this.userService.getUser(userId);
      res.send(user);
    } catch (error) {
      next(error);
    }
  };

  addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req.body;
      const result = await this.userService.addUser(user);

      if (!result?.result?.n) {
        res.status(StatusCodes.NOT_FOUND).send({ error: 'Could not add user!' });
        return;
      }

      res.sendStatus(StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req.body;
      const result = await this.userService.updateUser(user);

      if (!result?.result?.n) {
        res.status(StatusCodes.NOT_FOUND).send({ error: 'No user found to update!' });
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
