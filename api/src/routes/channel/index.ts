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
			const { topics, seed } = req.body as CreateChannelBody;
			const { userId } = req.user;

			if (!userId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.create(userId, topics, seed);
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

			const channel = await this.channelService.getLogs(channelAddress, userId);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { userId } = req.user;
			const { publicPayload, maskedPayload } = req.body as AddChannelLogBody;

			if (!channelAddress || !userId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.addLogs(channelAddress, publicPayload, maskedPayload, userId);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
