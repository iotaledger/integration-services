import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidationError } from 'express-json-validator-middleware';

/**
 * Error middleware to log and return the error to the client.
 *
 * @param {Error} err Received error from endpoint
 * @param {Request} req Client request
 * @param {Response} res Client response
 * @param {NextFunction} next Next function
 */
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err);
  if (err instanceof ValidationError) {
    res.status(StatusCodes.BAD_REQUEST);
    res.send({ error: 'No valid body provided!' });
    return;
  }
  res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  res.send({ error: err.message });
};
