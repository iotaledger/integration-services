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
			const { identityId } = req.user;

			if (!identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.create(identityId, topics, seed);
			return res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { identityId } = req.user;

			if (!channelAddress || !identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const limitParam = parseInt(<string>req.query.limit, 10);
			const indexParam = parseInt(<string>req.query.index, 10);
			const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
			const index = isNaN(indexParam) ? undefined : indexParam;
			const options = limit !== undefined && index !== undefined && { limit, index };

			const channel = await this.channelService.getLogs(channelAddress, identityId, options);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { identityId } = req.user;
			const { publicPayload, maskedPayload } = req.body as AddChannelLogBody;

			if (!channelAddress || !identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const channel = await this.channelService.addLogs(channelAddress, publicPayload, maskedPayload, identityId);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
