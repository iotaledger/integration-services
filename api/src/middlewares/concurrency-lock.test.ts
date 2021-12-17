import { StatusCodes } from 'http-status-codes';
import { basicLock } from './concurrency-lock';
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
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
		nextMock = jest.fn();
	});

	it('request has no user in request', async () => {
		const req: any = {
			// no user available
		};

		await basicLock(lockName)(req, res, nextMock);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'no user id provided!' });
	});

	it('lock already exists', async () => {
		const req: any = {
			user: UserIdentityMock.userData
		};

		const getLockSpy = jest
			.spyOn(ConcurrencyLockDb, 'getLock')
			.mockImplementationOnce(async () => ({ id: UserIdentityMock.userData.id, lock: lockName, created: new Date('01-01-2021') }));

		await basicLock(lockName)(req, res, nextMock);

		expect(getLockSpy).toHaveBeenCalledWith('revoke-credential-did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4');
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

		expect(getLockSpy).toHaveBeenCalledWith('revoke-credential-did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4');
		expect(insertLockSpy).toHaveBeenCalledWith('revoke-credential-did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4');
		expect(nextMock).toHaveBeenCalledWith();
	});
});
