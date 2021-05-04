import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChannelService } from '../../services/channel-service';
import { AuthenticatedRequest } from '../../models/types/authentication';

export class ChannelRoutes {
	private readonly channelService: ChannelService;
	constructor(channelService: ChannelService) {
		this.channelService = channelService;
	}

	createChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channel = await this.channelService.create(req.user.userId);
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.channelService.getLogs(body.isAuth);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.channelService.addLogs(body.channelAddress, body.publicPayload, body.maskedPayload, body.isAuth);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
