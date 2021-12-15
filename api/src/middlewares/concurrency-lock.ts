import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../models/types/verification';
import { getLock, insertLock, removeLock } from '../database/concurrency-lock';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../utils/logger/index';

export const concurrencyLock = (lockName: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const user = req?.user;
	if (!user || !user.id) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'no user id provided!' });
	}
	try {
		const lock = await getLock(user.id, lockName);

		if (lock) {
			return res.status(StatusCodes.LOCKED).send({ error: 'resource already in use, try it again!' });
		}

		await insertLock(user.id, lockName);
		next();
	} catch (e) {
		return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
	} finally {
		// release lock after wrapped function call has completed
		await releaseConcurrencyLock(user.id, lockName);
	}
};

export const releaseConcurrencyLock = async (id: string, lockName: string) => {
	const response = await removeLock(id, lockName);
	if (!response?.result?.n || response?.result?.n === 0) {
		Logger.getInstance().error('could not release the lock!');
	}
};
