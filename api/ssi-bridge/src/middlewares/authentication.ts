import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

export const isAuth = (secret: string) => (req: Request, res: Response, next: NextFunction) => {
	const { authorization } = req.headers;

	if (!authorization || !authorization.startsWith('Bearer')) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authenticated!' });
	}

	const split = authorization.split('Bearer ');
	if (split.length !== 2) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authenticated!' });
	}

	const token = split[1];
	const decodedToken: any = jwt.verify(token, secret);

	if (typeof decodedToken === 'string' || !decodedToken?.user) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authenticated!' });
	}

	(req as any).user = decodedToken.user;
	next();
};
