import { NextFunction, Response } from 'express';
import { AuthenticatedRequest, LockedRequest } from '../models/types/verification';
import { getLock, insertLock, removeLock } from '../database/concurrency-lock';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../utils/logger/index';

export const concurrencyLock = (lockName: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const user = req.user;
		if (!user || !user.id) {
			return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'no user id provided!' });
		}

		const lock = await getLock(user.id, lockName);
		if (lock) {
			// TODO check if lock is older than X seconds if so release it and continue
			return res.status(StatusCodes.LOCKED).send({ error: 'resource already in use, try it again!' });
		}

		await insertLock(user.id, lockName);

		(req as LockedRequest).releaseLock = releaseConcurrencyLock(user.id, lockName);
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
	}
	next();
};

export const releaseConcurrencyLock = (id: string, lockName: string) => async () => {
	const response = await removeLock(id, lockName);
	if (response.result.n === 0) {
		Logger.getInstance().error('could not release the lock!');
	}
};
