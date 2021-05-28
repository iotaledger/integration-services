import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const hasValidApiKey = (serverApiKey: string) => (req: Request, res: Response, next: NextFunction) => {
	const { apiKey } = req.query;

	if (serverApiKey && apiKey !== serverApiKey) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'no valid api key provided!' });
	}

	next();
};
