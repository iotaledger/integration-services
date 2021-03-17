import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const secret = CONFIG.serverSecret;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(401).send({ error: 'not authenticated!' });
  }

  const split = authorization.split('Bearer ');
  if (split.length !== 2) {
    return res.status(401).send({ error: 'not authenticated!' });
  }

  const token = split[1];
  let decodedToken: any;

  try {
    decodedToken = jwt.verify(token, secret);
  } catch (err) {
    err;
  }

  if (!decodedToken || !decodedToken?.user?.userId) {
    throw new Error('not authenticated!');
  }

  (req as any).userId = decodedToken.user.userId;
  next();
};
