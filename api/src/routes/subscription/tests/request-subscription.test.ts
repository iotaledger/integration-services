import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '..';
import { AccessRights, Subscription, SubscriptionType } from '../../../models/types/subscription';
import { SubscriptionPool } from '../../../pools/subscription-pools';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { UserService } from '../../../services/user-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';

describe('test request subscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService, subscriptionPool: SubscriptionPool;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;

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

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error("Cannot read property 'seed' of undefined"));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not request the subscription'));
	});

	it('should bad request if no identityId is provided', async () => {
		const req: any = {
			params: {},
			user: { identityId: undefined }, //no identityId,
			body: { accessRights: AccessRights.Read }
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
	});

	it('should return bad request since no channelAddress is provided', async () => {
		spyOn(subscriptionService, 'getSubscription').and.returnValue({}); // already a subscription is found!
		const req: any = {
			params: {}, // no channelAddress
			user: { identityId: 'did:iota1234' },
			body: { accessRights: AccessRights.Read }
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
	});

	it('should return bad request since already a subscription is requested', async () => {
		spyOn(subscriptionService, 'getSubscription').and.returnValue({}); // already a subscription is found!
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota1234' },
			body: { accessRights: AccessRights.Read }
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith('subscription already requested');
	});

	it('should create a subscription', async () => {
		spyOn(subscriptionService, 'getSubscription').and.returnValue(null);
		const subscriptionServiceAddSpy = spyOn(subscriptionService, 'addSubscription');
		const subscriptionPoolAddSpy = spyOn(subscriptionPool, 'add');
		const exportSubscriptionSpy = spyOn(streamsService, 'exportSubscription').and.returnValue('teststate');
		const addChannelSubscriberIdSpy = spyOn(channelInfoService, 'addChannelSubscriberId');
		const updateLatestChannelLinkSpy = spyOn(channelInfoService, 'updateLatestChannelLink');

		const requestSubscriptionSpy = spyOn(streamsService, 'requestSubscription').and.returnValue({
			subscriber: null,
			subscriptionLink: 'testlink',
			publicKey: 'testpublickey',
			seed: 'testseed'
		});
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read }
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		const expectedSubscription: Subscription = {
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

		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', undefined);
		expect(exportSubscriptionSpy).toHaveBeenCalled();
		expect(subscriptionPoolAddSpy).toHaveBeenCalled();
		expect(subscriptionServiceAddSpy).toHaveBeenCalledWith(expectedSubscription);
		expect(addChannelSubscriberIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(updateLatestChannelLinkSpy).toHaveBeenCalledWith('testaddress', 'testlink');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith({ seed: 'testseed', subscriptionLink: 'testlink' });
	});
});
