import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidationError } from 'express-json-validator-middleware';

/**
 * Error middleware to log and return the error to the client.
 *
 * @param {Error} err Received error from endpoint
 * @param {Request} _req Client request
 * @param {Response} res Client response
 * @param {NextFunction} _next Next function
 */
export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
	if (err instanceof ValidationError) {
		console.error(JSON.stringify(err));
		res.status(StatusCodes.BAD_REQUEST);
		res.send({ error: 'No valid body provided!' });
		return;
	}
	console.error(err);
	res.status(StatusCodes.INTERNAL_SERVER_ERROR);
	res.send({ error: err.message });
};
