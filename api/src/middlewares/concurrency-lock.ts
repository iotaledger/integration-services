import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../models/types/verification';
import { getLock, insertLock, removeLock } from '../database/concurrency-lock';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../utils/logger/index';
import _ from 'lodash';

export enum ConcurrecnyLocks {
	ChannelLock = 'channel-lock',
	CredentialLock = 'credential-lock'
}

const concurrencyLock = (lockName: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const afterResponse = async () => {
		res.removeListener('finish', afterResponse);
		await releaseConcurrencyLock(lockName)(); // release the lock after next() is finished
	};
	res.on('finish', afterResponse);

	try {
		const existingLock = await getLock(lockName);

		if (existingLock) {
			return res.status(StatusCodes.LOCKED).send({ error: 'resource already in use, try it again!' });
		}

		await insertLock(lockName);
	} catch (e) {
		await releaseConcurrencyLock(lockName)();
		return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
	}

	await next();
};

const releaseConcurrencyLock = (lockName: string) => async () => {
	const response = await removeLock(lockName);
	if (!response?.result?.n || response?.result?.n === 0) {
		Logger.getInstance().error('could not release the lockName!');
	}
};

export const basicLock = concurrencyLock;

export const channelLock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const channelAddress = _.get(req, 'params.channelAddress');
	if (!channelAddress) {
		throw new Error('no channelAddress provided!');
	}
	const userId = req?.user?.id;
	if (!userId) {
		throw new Error('no user id provided!');
	}

	const lock = `${ConcurrecnyLocks.ChannelLock}-${channelAddress}-${userId}`;

	return concurrencyLock(lock)(req, res, next);
};
