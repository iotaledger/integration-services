import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { writeChannel } from '../services/channel.service';
export class ViolationRoutes {
	/**
	 * Listens for SLAViolationCreateEvent
	 * @param req with SLAViolationCreateEvent in body
	 * @param res returns OK (200)
	 * @param next
	 * @returns
	 */
	writeSlaViolationCreateEvent = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
		try {
			console.log('Received violation...');
			const slaViolationCreateEvent = req.body;
			await writeChannel(slaViolationCreateEvent, 'slaViolationCreateNotification');
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			console.log(error);
			next(new Error('could not write violation'));
		}
	};
}
