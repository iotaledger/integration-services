import { NextFunction, Request, Response } from 'express';
import { ChannelInfo, ChannelInfoSearch } from '../../models/types/channel-info';
import { ChannelInfoService } from '../../services/channel-info-service';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { getDateFromString } from '../../utils/date';
import { AuthenticatedRequest } from '../../models/types/verification';
import { AuthorizationService } from '../../services/authorization-service';
import { ILogger } from '../../utils/logger';

export class ChannelInfoRoutes {
	constructor(
		private readonly channelInfoService: ChannelInfoService,
		private readonly authorizationService: AuthorizationService,
		private readonly logger: ILogger
	) {}

	searchChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelInfoSearch = this.getChannelInfoSearch(req);
			const channelInfos = await this.channelInfoService.searchChannelInfo(channelInfoSearch);
			res.send(channelInfos);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not search for the channel info'));
		}
	};

	getChannelInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');

			if (_.isEmpty(channelAddress)) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress);
			res.send(channelInfo);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the channel info'));
		}
	};

	addChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelInfo = req.body as ChannelInfo;

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, channelInfo.authorId);
			if (!isAuthorized) {
				throw error;
			}

			const result = await this.channelInfoService.addChannelInfo(channelInfo);
			if (!result?.result?.n) {
				res.status(StatusCodes.NOT_FOUND).send({ error: 'could not add channel info' });
				return;
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

			const channelInfo = await this.channelInfoService.getChannelInfo(channelInfoBody?.channelAddress);
			if (!channelInfo) {
				throw new Error('channel does not exist!');
			}

			const { isAuthorized, error } = this.authorizationService.isAuthorized(req.user, channelInfo.authorId);
			if (!isAuthorized) {
				throw error;
			}

			const result = await this.channelInfoService.updateChannelTopic(channelInfoBody);
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

	deleteChannelInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			if (_.isEmpty(channelAddress)) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}
			const channelInfo = await this.channelInfoService.getChannelInfo(channelAddress);
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
		const author = decodeParam(<string>req.query.author);
		const topicType = decodeParam(<string>req.query['topic-type']);
		const topicSource = decodeParam(<string>req.query['topic-source']);
		const created = decodeParam(<string>req.query.created);
		const latestMessage = decodeParam(<string>req.query['latest-message']);
		const limitParam = parseInt(<string>req.query.limit, 10);
		const indexParam = parseInt(<string>req.query.index, 10);
		const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
		const index = isNaN(indexParam) ? undefined : indexParam;

		return {
			author,
			authorId,
			topicType,
			topicSource,
			limit,
			index,
			created: getDateFromString(created),
			latestMessage: getDateFromString(latestMessage)
		};
	};
}
