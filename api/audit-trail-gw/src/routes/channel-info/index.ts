import { NextFunction, Request, Response } from 'express';
import { ChannelInfo, ChannelInfoSearch, getDateFromString, AuthenticatedRequest, ILogger } from '@iota/is-shared-modules';
import { ChannelInfoService } from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { AuthorizationService } from '../../services/authorization-service';
export class ChannelInfoRoutes {
	constructor(
		private readonly channelInfoService: ChannelInfoService,
		private readonly authorizationService: AuthorizationService,
		private readonly logger: ILogger
	) { }

	searchChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
		try {
			const channelInfoSearch = this.getChannelInfoSearch(req);
			const isAdmin = this.authorizationService.isAuthorizedAdmin(req.user);
			const channelInfos = await this.channelInfoService.searchChannelInfo(channelInfoSearch, req.user.id, isAdmin);

			res.send(channelInfos);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not search for the channel info'));
		}
	};

	getChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');

			if (_.isEmpty(channelAddress)) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress provided' });
			}

			const isAdmin = this.authorizationService.isAuthorizedAdmin(req?.user);
			const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress, req.user.id, isAdmin);

			res.send(channelInfo);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the channel info'));
		}
	};

	addChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
		try {
			const channelInfo = req.body as ChannelInfo;

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, channelInfo.authorId);
			if (!isAuthorized) {
				throw error;
			}

			const result = await this.channelInfoService.addChannelInfo(channelInfo);

			if (!result?.result?.n) {
				return res.status(StatusCodes.NOT_FOUND).send({ error: 'could not add channel info' });
			}

			res.sendStatus(StatusCodes.CREATED);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not add the channel info'));
		}
	};

	updateChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelInfoBody = req.body as ChannelInfo;

			const isAdmin = this.authorizationService.isAuthorizedAdmin(req?.user);
			const channelInfo = await this.channelInfoService.getChannelInfo(channelInfoBody?.channelAddress, req?.user?.id, isAdmin);
			if (!channelInfo) {
				throw new Error('channel does not exist!');
			}

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, channelInfo.authorId);
			if (!isAuthorized) {
				throw error;
			}

			const result = await this.channelInfoService.updateChannel(channelInfoBody);
			if (!result?.result?.n) {
				res.status(StatusCodes.NOT_FOUND).send({ error: 'No channel info found to update!' });
				return;
			}

			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not update the channel info'));
		}
	};

	deleteChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			if (_.isEmpty(channelAddress)) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress provided' });
			}
			const isAdmin = this.authorizationService.isAuthorizedAdmin(req?.user);
			const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress, req?.user?.id, isAdmin);
			if (!channelInfo) {
				throw new Error('channel does not exist!');
			}

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, channelInfo.authorId);
			if (!isAuthorized) {
				throw error;
			}

			await this.channelInfoService.deleteChannelInfo(channelAddress);
			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not delete the channel info'));
		}
	};

	getChannelInfoSearch = (req: Request): ChannelInfoSearch => {
		const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
		const authorId = decodeParam(<string>req.query['author-id']);
		const subscriberId = decodeParam(<string>req.query['subscriber-id']);
		const requestedSubscriptionId = decodeParam(<string>req.query['requested-subscription-id']);
		const name = decodeParam(<string>req.query['name']);
		const hidden = decodeParam(<string>req.query.hidden) ? decodeParam(<string>req.query.hidden) === 'true' : undefined;
		const topicType = decodeParam(<string>req.query['topic-type']);
		const topicSource = decodeParam(<string>req.query['topic-source']);
		const created = decodeParam(<string>req.query.created);
		const latestMessage = decodeParam(<string>req.query['latest-message']);
		const limitParam = parseInt(<string>req.query.limit, 10);
		const indexParam = parseInt(<string>req.query.index, 10);
		const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
		const index = isNaN(indexParam) ? undefined : indexParam;
		// If ascending is undefined, don't sort otherwise sort ascending or descending
		const ascending = decodeParam(<string>req.query.asc) ? decodeParam(<string>req.query.asc) === 'true' : undefined;

		return {
			authorId,
			subscriberId,
			requestedSubscriptionId,
			name,
			hidden,
			topicType,
			topicSource,
			limit,
			index,
			created: getDateFromString(created),
			latestMessage: getDateFromString(latestMessage),
			ascending
		};
	};
}
