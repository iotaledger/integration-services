import { SubscriptionPool } from '.';
import * as SubscriptionDb from '../../database/subscription';

describe('test subscription pool', () => {
	const pool = new SubscriptionPool('node');
	let dateNowSpy: any;
	const channelAddress = 'test123';
	beforeEach(() => {
		dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1623746820747);
		pool.add(channelAddress, { id: 'imanauthor1' } as any, 'iota:did:imanauthor1', true);
		pool.add(channelAddress, { id: 'imasubscriber1' } as any, 'iota:did:imasubscriber1', false);
	});

	afterEach(function () {
		dateNowSpy.mockRestore();
	});
	describe('check if expected subscriptions will be returned', () => {
		it('should return expected subscriptions', async () => {
			const pw = 'verysecretpassword';
			const getSubscriptionSpy = spyOn(SubscriptionDb, 'getSubscription').and.returnValue(undefined); // not found!

			// objects from array in pool
			expect(await pool.get(channelAddress, 'iota:did:imanauthor1', true, pw)).toEqual({ id: 'imanauthor1' });
			expect(await pool.get(channelAddress, 'iota:did:imasubscriber1', false, pw)).toEqual({ id: 'imasubscriber1' }); // object from array in pool

			// called from database but not found
			await expect(pool.get(channelAddress, 'iota:did:authornotfoundinpool', false, pw)).rejects.toThrow(
				'no subscription found for channelAddress: test123 and identityId: iota:did:authornotfoundinpool'
			);
			await expect(pool.get(channelAddress, 'iota:did:subscribernotfoundinpool', true, pw)).rejects.toThrow(
				'no subscription found for channelAddress: test123 and identityId: iota:did:subscribernotfoundinpool'
			);
			expect(getSubscriptionSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('check if expected subscriptions will be cleared', () => {
		it('should clear old subscriptions but not newer', async () => {
			dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1623746842265); // 17 seconds later than 1623746820747
			pool.clearObsoleteObjects();
			expect(pool.authors.length).toBe(0);
			expect(pool.subscribers.length).toBe(0);

			// this entry should not be deleted since it was recently added
			pool.add(channelAddress, { id: 'imanauthor2' } as any, 'iota:did:imanauthor2', true);
			pool.clearObsoleteObjects();
			expect(pool.authors.length).toBe(1);
		});
	});
});
