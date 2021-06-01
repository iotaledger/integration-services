import { SubscriptionPool } from '.';
import * as SubscriptionDb from '../../database/subscription';

describe('test subscription pool', () => {
	const pool = SubscriptionPool.getInstance('node');
	const channelAddress = 'test123';
	beforeEach(() => {
		pool.add(channelAddress, { id: 'imanauthor1' } as any, 'iota:did:imanauthor1', true);
		pool.add(channelAddress, { id: 'imasubscriber1' } as any, 'iota:did:imasubscriber1', false);
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
});
