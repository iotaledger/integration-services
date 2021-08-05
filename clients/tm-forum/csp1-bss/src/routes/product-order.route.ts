import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class ProductOrderRoutes {
	constructor() {}

	forwardProductOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
	};
}
