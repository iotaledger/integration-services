import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const authenticationMiddleware = (req: Request, res: Response, _next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const split = authorization.split('Bearer ');
  if (split.length !== 2) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  // TODO else check jwt if it is valid by splitting the bearer token
  // const token = split[1];

  res.status(StatusCodes.OK);
  res.send({});
};
