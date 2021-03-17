import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

export const isAuth = (serverSecret: string) => (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authenticated!' });
  }

  const split = authorization.split('Bearer ');
  if (split.length !== 2) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authenticated!' });
  }

  const token = split[1];
  let decodedToken: any;

  try {
    decodedToken = jwt.verify(token, serverSecret);
  } catch (err) {
    throw err;
  }

  if (!decodedToken || !decodedToken?.user?.userId) {
    return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authenticated!' });
  }

  (req as any).userId = decodedToken.user.userId;
  next();
};
