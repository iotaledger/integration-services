import { NextFunction, Request, Response } from 'express';
import { UserSearch, UserType } from '../../models/types/user';
import { UserService } from '../../services/user-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString } from '../../utils/date';
import { AuthenticatedRequest } from '../../models/types/verification';
import { AuthorizationService } from '../../services/authorization-service';
import { CreateIdentityBody } from '../../models/types/identity';
import { UserSchemaBody } from '../../models/types/request-bodies';
import { ILogger } from '../../utils/logger';

export class IdentityRoutes {
	constructor(
		private readonly userService: UserService,
		private readonly authorizationService: AuthorizationService,
		private readonly logger: ILogger
	) {}

	createIdentity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const createIdentityBody: CreateIdentityBody = req.body;
			const identity = await this.userService.createIdentity(createIdentityBody);

			res.status(StatusCodes.CREATED).send(identity);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not create the identity'));
		}
	};

	searchUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userSearch = this.getUserSearch(req);
			const users = await this.userService.searchUsers(userSearch);
			res.send(users);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not search for the identity'));
		}
	};

	getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const identityId = _.get(req, 'params.identityId');

			if (_.isEmpty(identityId)) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const user = await this.userService.getUser(identityId);
			res.send(user);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the identity'));
		}
	};

	addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const user = req.body as UserSchemaBody;
			const result = await this.userService.addUser(user);

			if (!result?.result?.n) {
				res.status(StatusCodes.NOT_FOUND).send({ error: 'could not add user!' });
				return;
			}

			res.sendStatus(StatusCodes.CREATED);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not add the identity'));
		}
	};

	updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const user = req.body;

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, user.identityId);
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
			this.logger.error(error);
			next(new Error('could not update the identity'));
		}
	};

	deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const identityId = _.get(req, 'params.identityId');
			if (_.isEmpty(identityId)) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, identityId);
			if (!isAuthorized) {
				throw error;
			}

			await this.userService.deleteUser(identityId);
			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not delete the identity'));
		}
	};

	getUserSearch = (req: Request): UserSearch => {
		const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
		const type = decodeParam(<string>req.query.type);
		const username = decodeParam(<string>req.query.username);
		const registrationDate = decodeParam(<string>req.query['registration-date']);
		const limitParam = parseInt(<string>req.query.limit, 10);
		const indexParam = parseInt(<string>req.query.index, 10);
		const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
		const index = isNaN(indexParam) ? undefined : indexParam;

		return {
			type: <UserType>type,
			index,
			limit,
			username,
			registrationDate: getDateFromString(registrationDate)
		};
	};
}
