import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { StreamsService } from '../../services/streams-service';

export class ChannelRoutes {
	private readonly streamsService: StreamsService;
	constructor(streamsService: StreamsService) {
		this.streamsService = streamsService;
	}

	createChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channel = await this.streamsService.create();
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channel = await this.streamsService.getLogs();
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	addLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.streamsService.addLogs(body.address, body.publicPayload, body.maskedPayload);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
