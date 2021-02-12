import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  res.send({ error: err.message });
};
