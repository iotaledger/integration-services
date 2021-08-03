import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '..';
import { Subscription } from '../../../models/types/subscription';
import { AccessRights, SubscriptionType } from '../../../models/schemas/subscription';
import { SubscriptionPool } from '../../../pools/subscription-pools';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { UserService } from '../../../services/user-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';
import * as subscriptionDb from '../../../database/subscription';

describe('test authorize subscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService, subscriptionPool: SubscriptionPool;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		identityId: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		seed: 'testseed',
		state: 'teststate',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService({} as any, '', LoggerMock);
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionPool = new SubscriptionPool(streamsService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, subscriptionPool, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should call nextMock if no body is provided', async () => {
		const loggerSpy = spyOn(LoggerMock, 'error');
		const req: any = {
			params: {},
			user: { identityId: undefined },
			body: undefined // no body
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error("Cannot read property 'subscriptionLink' of undefined"));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should bad request if no identityId is provided', async () => {
		const req: any = {
			params: {},
			user: { identityId: undefined }, //no identityId,
			body: { accessRights: AccessRights.Read }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
	});

	it('should return error if no subscription using the link is found to authorize', async () => {
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscriptionByLink').and.returnValue(null); // no subscription found to authorize
		const req: any = {
			params: {}, // no channelAddress
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read } // no link provided so getSubscriptionByLink should return null
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return error if no subscription using the id is found to authorize', async () => {
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscription').and.returnValue(null); // no subscription found to authorize
		const req: any = {
			params: {}, // no channelAddress
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return bad request since subscription is already authorized', async () => {
		const sub = { ...subscriptionMock, isAuthorized: true };
		spyOn(subscriptionService, 'getSubscription').and.returnValue(sub);
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith('subscription already authorized');
	});

	it('should throw an error since the author of the channel is not found', async () => {
		const authorId = 'did:iota:1234';
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscription').and.returnValue(subscriptionMock);
		const getAuthorSpy = spyOn(subscriptionPool, 'get').and.returnValue(null); // no author found
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(getAuthorSpy).toHaveBeenCalledWith('testaddress', authorId, true);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no author found with channelAddress: testaddress and identityId: did:iota:1234'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should throw an error since the authorization has no keyloadLink', async () => {
		const authorId = 'did:iota:1234';
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscription').and.returnValue(subscriptionMock);
		spyOn(subscriptionDb, 'getSubscriptions').and.returnValue([]);
		const receiveSubscribeSpy = spyOn(streamsService, 'receiveSubscribe');
		const authorMock = { sync_state: jest.fn() };
		const getAuthorSpy = spyOn(subscriptionPool, 'get').and.returnValue(authorMock); // author found
		const authorizeSubscriptionSpy = spyOn(streamsService, 'authorizeSubscription').and.returnValue({ keyloadLink: '' });
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.ReadAndWrite, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(getAuthorSpy).toHaveBeenCalledWith('testaddress', authorId, true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey'], authorMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no keyload link found when authorizing the subscription'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return keyloadLink for authorized subscription', async () => {
		const authorId = 'did:iota:1234';
		spyOn(subscriptionService, 'getSubscription').and.returnValue(subscriptionMock);
		spyOn(subscriptionDb, 'getSubscriptions').and.returnValue([]);
		const authorMock = { sync_state: jest.fn() };
		const receiveSubscribeSpy = spyOn(streamsService, 'receiveSubscribe');
		const getAuthorSpy = spyOn(subscriptionPool, 'get').and.returnValue(authorMock); // author found
		const updateSubscriptionStateSpy = spyOn(subscriptionService, 'updateSubscriptionState');
		const authorizeSubscriptionSpy = spyOn(streamsService, 'authorizeSubscription').and.returnValue({
			keyloadLink: 'testkeyloadlink',
			author: authorMock
		}); // keyloadLink got created
		const exportSubscriptionSpy = spyOn(streamsService, 'exportSubscription').and.returnValue('new-state');
		const setSubscriptionAuthorizedSpy = spyOn(subscriptionService, 'setSubscriptionAuthorized');
		const updateLatestChannelLinkSpy = spyOn(channelInfoService, 'updateLatestChannelLink');
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(getAuthorSpy).toHaveBeenCalledWith('testaddress', authorId, true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey'], authorMock);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', 'testlink', 'testkeyloadlink');
		expect(updateLatestChannelLinkSpy).toHaveBeenCalledWith('testaddress', 'testkeyloadlink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234', 'new-state');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink' });
	});
});
