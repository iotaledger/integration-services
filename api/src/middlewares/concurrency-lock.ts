import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../models/types/verification';
import { getLock, insertLock, removeLock } from '../database/concurrency-lock';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../utils/logger/index';

export const concurrencyLock = (lockName: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const user = req?.user;
	try {
		if (!user || !user.id) {
			return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'no user id provided!' });
		}

		const lock = await getLock(user.id, lockName);

		if (lock) {
			// TODO check if lock is older than X seconds if so release it and continue
			// ==> will be solved by TTL of MongoDB to 60s

			return res.status(StatusCodes.LOCKED).send({ error: 'resource already in use, try it again!' });
		}

		await insertLock(user.id, lockName);
	} catch (e) {
		await releaseConcurrencyLock(user.id, lockName);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
	}

	next();

	// release lock after wrapped function call has completed
	await releaseConcurrencyLock(user.id, lockName);
};

const releaseConcurrencyLock = async (id: string, lockName: string) => {
	const response = await removeLock(id, lockName);
	if (response.result.n === 0) {
		Logger.getInstance().error('could not release the lock!');
	}
};
