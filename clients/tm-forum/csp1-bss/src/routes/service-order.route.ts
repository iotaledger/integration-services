import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class ServiceOrderRoutes {
	constructor() {}

	forwardServiceOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
	};

	writeChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
	};
}
