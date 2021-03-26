import { NextFunction, Request, Response } from 'express';
import { User, UserSearch, UserClassification } from '../../models/types/user';
import { UserService } from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString } from '../../utils/date';
import { AuthenticatedRequest, AuthorizationCheck } from '../../models/types/authentication';

export class UserRoutes {
	private readonly userService: UserService;
	constructor(userService: UserService) {
		this.userService = userService;
	}

	searchUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
				res.status(StatusCodes.NOT_FOUND).send({ error: 'could not add user!' });
				return;
			}

			res.sendStatus(StatusCodes.CREATED);
		} catch (error) {
			next(error);
		}
	};

	updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const user: User = req.body;

			const { isAuthorized, error } = this.isAuthorized(req.userId, user.userId);
			if (!isAuthorized) {
				throw error;
			}

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

	deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = _.get(req, 'params.userId');
			if (_.isEmpty(userId)) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const { isAuthorized, error } = this.isAuthorized(req.userId, userId);
			if (!isAuthorized) {
				throw error;
			}

			await this.userService.deleteUser(userId);
			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			next(error);
		}
	};

	getUserSearch = (req: Request): UserSearch => {
		const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
		const classification = decodeParam(<string>req.query.classification);
		const organization = decodeParam(<string>req.query.organization);
		const username = decodeParam(<string>req.query.username);
		const verifiedParam = decodeParam(<string>req.query.verified);
		const registrationDate = decodeParam(<string>req.query['registration-date']);
		const verified = verifiedParam != null ? Boolean(verifiedParam) : undefined;
		let subscribedChannelIds: string[] = <string[]>req.query['subscribed-channel-ids'] || undefined;
		if (subscribedChannelIds != null && !Array.isArray(subscribedChannelIds)) {
			// we have a string instead of string array!
			subscribedChannelIds = [decodeParam(subscribedChannelIds)];
		} else if (Array.isArray(subscribedChannelIds)) {
			subscribedChannelIds = subscribedChannelIds.map((s) => decodeParam(s));
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
			subscribedChannelIds
		};
	};

	private isAuthorized = (requestUid: string, userId: string): AuthorizationCheck => {
		if (requestUid !== userId) {
			return { isAuthorized: false, error: new Error('not allowed!') };
		}

		return { isAuthorized: true, error: null };
	};
}
