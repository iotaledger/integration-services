import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { ChannelService } from '../../services/channel-service';

export class ChannelRoutes {
	private readonly channelService: ChannelService;
	constructor(channelService: ChannelService) {
		this.channelService = channelService;
	}

	createChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channel = await this.channelService.create();
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channel = await this.channelService.getLogs();
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.channelService.addLogs(body.address, body.publicPayload, body.maskedPayload);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
