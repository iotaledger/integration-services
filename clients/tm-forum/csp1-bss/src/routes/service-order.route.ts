import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hashNonce } from '../utils/encryption';
import { writeChannel } from '../services/channel.service';

export class ServiceOrderRoutes {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	forwardServiceOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
	};

	writeServiceOrderCreateEvent = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
		try {
			const serviceOrderCreateEvent = req.body;
			const hashedData = hashNonce(JSON.stringify(serviceOrderCreateEvent));
			const payload = { time: new Date(), hashedData };
			await writeChannel(payload, 'serviceOrderCreateEvent');
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			console.log(error);
			next(new Error('Could not write service order create event'));
		}
	};
}
