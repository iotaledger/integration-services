import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChannelService } from '../../services/channel-service';
import { AuthenticatedRequest } from '../../models/types/authentication';
import * as _ from 'lodash';
import { AddChannelLogBody, CreateChannelBody } from '../../models/types/request-bodies';

export class ChannelRoutes {
	private readonly channelService: ChannelService;
	constructor(channelService: ChannelService) {
		this.channelService = channelService;
	}

	createChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const { topics, seed, encrypted } = req.body as CreateChannelBody;
			const { userId } = req.user;

			if (!userId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.create(userId, topics, encrypted, seed);
			return res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { userId } = req.user;

			if (!channelAddress || !userId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const limitParam = parseInt(<string>req.query.limit, 10);
			const indexParam = parseInt(<string>req.query.index, 10);
			const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
			const index = isNaN(indexParam) ? undefined : indexParam;
			const options = limit !== undefined && index !== undefined && { limit, index };

			const channel = await this.channelService.getLogs(channelAddress, userId, options);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { userId } = req.user;
			const body = req.body as AddChannelLogBody;

			if (!channelAddress || !userId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.addLogs(channelAddress, userId, body);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
