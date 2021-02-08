import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(err);

  res.status(StatusCodes.CONFLICT);
  res.send({ error: err.message });
}
