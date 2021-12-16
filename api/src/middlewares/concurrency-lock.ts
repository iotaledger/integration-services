import { NextFunction, Response } from 'express';
import { AuthenticatedRequest, LockedRequest } from '../models/types/verification';
import { getLock, insertLock, removeLock } from '../database/concurrency-lock';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../utils/logger/index';

export const concurrencyLock = (lockName: string, considerUserId = true) => async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const user = req?.user;

	if (!user || !user.id) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'no user id provided!' });
	}

	const lock = considerUserId ? `${lockName}-${user.id}` : lockName;

	try {
		console.log('lock', lock);

		const existingLock = await getLock(lock);

		if (existingLock) {
			return res.status(StatusCodes.LOCKED).send({ error: 'resource already in use, try it again!' });
		}

		await insertLock(lock);
		(req as LockedRequest).releaseLock = releaseConcurrencyLock(lock);
	} catch (e) {
		releaseConcurrencyLock(lock)();
		return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
	}

	await next();
};

export const releaseConcurrencyLock = (lock: string) => async () => {
	const response = await removeLock(lock);
	if (!response?.result?.n || response?.result?.n === 0) {
		Logger.getInstance().error('could not release the lock!');
	}
};
