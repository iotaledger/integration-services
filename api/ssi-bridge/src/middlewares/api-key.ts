import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const hasValidApiKey = (serverApiKey: string) => (req: Request, res: Response, next: NextFunction) => {
	const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
	const apiKey = req.query && decodeParam(<string>req.query['api-key']);

	if (serverApiKey && apiKey !== serverApiKey) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'no valid api key provided!' });
	}

	next();
};
