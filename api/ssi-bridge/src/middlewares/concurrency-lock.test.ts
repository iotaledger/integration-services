import { StatusCodes } from 'http-status-codes';
import { basicLock, channelLock } from './concurrency-lock';
import { UserIdentityMock } from '../test/mocks/identities';
import * as ConcurrencyLockDb from '../database/concurrency-lock';

describe('test authentication middleware', () => {
	const lockName = 'revoke-credential';
	let nextMock: any, res: any, sendMock: any, sendStatusMock: any;
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		res = {
			on: jest.fn(),
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
		nextMock = jest.fn();
	});

	it('lock already exists', async () => {
		const req: any = {
			user: UserIdentityMock.userData
		};

		const getLockSpy = jest
			.spyOn(ConcurrencyLockDb, 'getLock')
			.mockImplementationOnce(async () => ({ id: UserIdentityMock.userData.id, lock: lockName, created: new Date('01-01-2021') }));

		await basicLock(lockName)(req, res, nextMock);

		expect(getLockSpy).toHaveBeenCalledWith('revoke-credential');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.LOCKED);
		expect(res.send).toHaveBeenCalledWith({ error: 'resource already in use, try it again!' });
	});

	it('will create and release a lock', async () => {
		const req: any = {
			user: UserIdentityMock.userData
		};

		const getLockSpy = jest.spyOn(ConcurrencyLockDb, 'getLock').mockImplementationOnce(async () => null);
		const insertLockSpy = jest.spyOn(ConcurrencyLockDb, 'insertLock').mockImplementationOnce(async () => null);

		await basicLock(lockName)(req, res, nextMock);

		expect(getLockSpy).toHaveBeenCalledWith('revoke-credential');
		expect(insertLockSpy).toHaveBeenCalledWith('revoke-credential');
		expect(nextMock).toHaveBeenCalledWith();
	});

	it('no channelAddress provided', async () => {
		const req: any = {
			user: UserIdentityMock.userData
		};
		await expect(channelLock(req, res, nextMock)).rejects.toThrow('no channelAddress provided!');
	});

	it('no user provided', async () => {
		const req: any = {
			params: {
				channelAddress: 'testaddress'
			}
		};
		await expect(channelLock(req, res, nextMock)).rejects.toThrow('no user id provided!');
	});

	it('will create and release a chnanel lock', async () => {
		const req: any = {
			user: UserIdentityMock.userData,
			params: {
				channelAddress: 'testaddress'
			}
		};

		const getLockSpy = jest.spyOn(ConcurrencyLockDb, 'getLock').mockImplementationOnce(async () => null);
		const insertLockSpy = jest.spyOn(ConcurrencyLockDb, 'insertLock').mockImplementationOnce(async () => null);

		await channelLock(req, res, nextMock);

		expect(getLockSpy).toHaveBeenCalledWith('channel-lock-testaddress-did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc');
		expect(insertLockSpy).toHaveBeenCalledWith('channel-lock-testaddress-did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc');
		expect(nextMock).toHaveBeenCalledWith();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});
});
