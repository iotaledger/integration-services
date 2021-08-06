import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hashNonce } from '../utils/encryption';
import { writeChannel } from '../services/channel.service';

export class ServiceOrderRoutes {
	constructor() {}

	forwardServiceOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
	};

	writeServiceOrderCreateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const serviceOrderCreateEvent = req.body;
			const hashedData = hashNonce(JSON.stringify(serviceOrderCreateEvent));
			const payload = {time: new Date(), hashedData};
			await writeChannel(payload, 'serviceOrderCreateEvent');
		} catch (error) {
			next(new Error(' '))
		}
		

	};
}
