import { StatusCodes } from 'http-status-codes';
import { concurrencyLock } from './concurrency-lock';
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

		await concurrencyLock(lockName)(req, res, nextMock);

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
		const removeLockSpy = jest.spyOn(ConcurrencyLockDb, 'removeLock').mockImplementationOnce(async () => null);

		await concurrencyLock(lockName)(req, res, nextMock);

		expect(getLockSpy).toHaveBeenCalledWith('did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4', 'revoke-credential');
		expect(removeLockSpy).toHaveBeenCalledWith('did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4', 'revoke-credential');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.LOCKED);
		expect(res.send).toHaveBeenCalledWith({ error: 'resource already in use, try it again!' });
	});

	it('will create and release a lock', async () => {
		const req: any = {
			user: UserIdentityMock.userData
		};

		const getLockSpy = jest.spyOn(ConcurrencyLockDb, 'getLock').mockImplementationOnce(async () => null);
		const insertLockSpy = jest.spyOn(ConcurrencyLockDb, 'insertLock').mockImplementationOnce(async () => null);
		const removeLockSpy = jest.spyOn(ConcurrencyLockDb, 'removeLock').mockImplementationOnce(async () => ({
			result: {
				n: 1
			}
		}));

		await concurrencyLock(lockName)(req, res, nextMock);

		expect(getLockSpy).toHaveBeenCalledWith('did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4', 'revoke-credential');
		expect(insertLockSpy).toHaveBeenCalledWith('did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4', 'revoke-credential');
		expect(removeLockSpy).toHaveBeenCalledWith('did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4', 'revoke-credential');
		expect(nextMock).toHaveBeenCalledWith();
	});
});
