import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '..';
import { AccessRights, SubscriptionType } from '@iota-is/shared-modules/lib/models/schemas/subscription';
import { Subscription } from '@iota-is/shared-modules/lib/models/types/subscription';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { UserService } from '../../../services/user-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';

describe('test getSubscriptions and getSubscriptionByIdentity routes', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		id: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		state: 'teststate',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService();
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should bad request since no channelAddress is provided', async () => {
		const req: any = {
			params: {}, // missing channelAddress
			user: {},
			body: {}
		};
		await subscriptionRoutes.getSubscriptions(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress provided' });
	});

	it('should return ok with subscription', async () => {
		jest.spyOn(subscriptionService, 'getSubscriptions').mockImplementation(async () => [subscriptionMock]);
		const channelAddress = 'testaddress';
		const req: any = {
			params: { channelAddress },
			user: { id: 'did:iota:1234' },
			body: undefined
		};
		await subscriptionRoutes.getSubscriptions(req, res, nextMock);
		expect(subscriptionService.getSubscriptions).toHaveBeenCalledWith(channelAddress, undefined);
		expect(res.send).toHaveBeenCalledWith([subscriptionMock]);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
	});

	it('should return ok with service receiving isAuthorized equals true', async () => {
		jest.spyOn(subscriptionService, 'getSubscriptions').mockImplementation(async () => [subscriptionMock]);
		const channelAddress = 'testaddress';
		const isAuthorized = 'true';
		const req: any = {
			params: { channelAddress },
			query: { 'is-authorized': isAuthorized },
			user: { id: 'did:iota:1234' },
			body: undefined
		};
		await subscriptionRoutes.getSubscriptions(req, res, nextMock);
		expect(subscriptionService.getSubscriptions).toHaveBeenCalledWith(channelAddress, true);
		expect(res.send).toHaveBeenCalledWith([subscriptionMock]);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
	});

	it('should return ok with service receiving isAuthorized equals false', async () => {
		jest.spyOn(subscriptionService, 'getSubscriptions').mockImplementation(async () => [subscriptionMock]);
		const channelAddress = 'testaddress';
		const isAuthorized = 'false';
		const req: any = {
			params: { channelAddress },
			query: { 'is-authorized': isAuthorized },
			user: { id: 'did:iota:1234' },
			body: undefined
		};
		await subscriptionRoutes.getSubscriptions(req, res, nextMock);
		expect(subscriptionService.getSubscriptions).toHaveBeenCalledWith(channelAddress, false);
		expect(res.send).toHaveBeenCalledWith([subscriptionMock]);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
	});

	it('should return bad request since params are missing', async () => {
		const req: any = {
			params: {}, // missing channelAddress and id
			user: { id: 'did:iota:1234' },
			body: undefined
		};
		await subscriptionRoutes.getSubscriptionByIdentity(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	it('should return bad request since params are missing', async () => {
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => subscriptionMock);
		const channelAddress = 'did:iota:1234';
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: undefined
		};
		await subscriptionRoutes.getSubscriptionByIdentity(req, res, nextMock);
		expect(subscriptionService.getSubscription).toHaveBeenCalledWith(channelAddress, id);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith(subscriptionMock);
	});
});

describe('test addSubscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		id: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		state: 'teststate',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService();
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request since params are missing', async () => {
		const req: any = {
			params: {},
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.addSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress, id or publicKey provided' });
	});

	it('should return bad request since subscription has no publicKey', async () => {
		// shallow object copy
		const subscriptionMockWithoutPublicKey = Object.assign({}, subscriptionMock);
		delete subscriptionMockWithoutPublicKey.publicKey;
		const channelAddress = '1234234234';
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMockWithoutPublicKey
		};
		await subscriptionRoutes.addSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress, id or publicKey provided' });
	});

	it('should return bad request since subscription has already been added', async () => {
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => subscriptionMock);
		const channelAddress = '1234234234';
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.addSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'subscription already added' });
	});

	it('should not return created since publicKey already used by other identity', async () => {
		jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => undefined);
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => undefined);
		jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockImplementation(async () => subscriptionMock);
		const channelAddress = 'did:iota:1234';
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.addSubscription(req, res, nextMock);

		expect(subscriptionService.addSubscription).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'subscription already added' });
	});

	it('should return created', async () => {
		jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => undefined);
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => undefined);
		jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockImplementation(async () => null);
		const channelAddress = 'did:iota:1234';
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.addSubscription(req, res, nextMock);
		expect(subscriptionService.addSubscription).toHaveBeenCalledWith(subscriptionMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith(subscriptionMock);
	});
});

describe('test updateSubscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		id: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		state: 'teststate',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService();
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request since params are missing', async () => {
		const req: any = {
			params: {},
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.updateSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	it('should return unauthorized since userIdentityId and subscriberId, userIdentityId and authorId do not match', async () => {
		jest.spyOn(channelInfoService, 'getChannelInfo').mockImplementation(async () => ({
			authorId: 'did:iota:91011',
			channelAddress: '1234234234',
			topics: []
		}));
		const channelAddress = '1234234234';
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.updateSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'not authorized to update the subscription' });
	});

	it('should return not found since so subscription with channelAddress and id does not exist', async () => {
		jest.spyOn(channelInfoService, 'getChannelInfo').mockImplementation(async () => ({
			authorId: 'did:iota:91011',
			channelAddress: '1234234234',
			topics: []
		}));
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => undefined);
		const channelAddress = '1234234234';
		const id = 'did:iota:1234';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.updateSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
		expect(res.send).toHaveBeenCalledWith({ error: 'no subscription found' });
	});

	it('should return ok', async () => {
		jest.spyOn(channelInfoService, 'getChannelInfo').mockImplementation(async () => ({
			authorId: 'did:iota:91011',
			channelAddress: '1234234234',
			topics: []
		}));
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => ({
			...subscriptionMock
		}));
		jest.spyOn(subscriptionService, 'updateSubscription').mockImplementation(async () => undefined);
		const channelAddress = 'did:iota:1234';
		const id = 'did:iota:1234';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.updateSubscription(req, res, nextMock);

		expect(subscriptionService.updateSubscription).toHaveBeenCalledWith(channelAddress, id, subscriptionMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith();
	});
});

describe('test deleteSubscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		id: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		state: 'teststate',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService();
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request since params are missing', async () => {
		const req: any = {
			params: {},
			user: { id: 'did:iota:1234' }
		};
		await subscriptionRoutes.deleteSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	it('should return unauthorized since userIdentityId and subscriberId, userIdentityId and authorId do not match', async () => {
		const channelAddress = '1234234234';
		jest.spyOn(channelInfoService, 'getChannelInfo').mockImplementation(async () => ({
			authorId: 'did:iota:91011',
			channelAddress,
			topics: []
		}));
		const id = 'did:iota:5678';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' }
		};
		await subscriptionRoutes.deleteSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
		expect(res.send).toHaveBeenCalledWith({ error: 'not authorized to delete the subscription' });
	});

	it('should return not found since so subscription with channelAddress and id does not exist', async () => {
		const channelAddress = '1234234234';
		jest.spyOn(channelInfoService, 'getChannelInfo').mockImplementation(async () => ({
			authorId: 'did:iota:91011',
			channelAddress,
			topics: []
		}));
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => undefined);
		const id = 'did:iota:1234';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.deleteSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
		expect(res.send).toHaveBeenCalledWith({ error: 'no subscription found' });
	});

	it('should return ok', async () => {
		const channelAddress = 'did:iota:1234';
		jest.spyOn(channelInfoService, 'getChannelInfo').mockImplementation(async () => ({
			authorId: 'did:iota:91011',
			channelAddress,
			topics: []
		}));
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => ({
			...subscriptionMock,
			channelAddress
		}));
		jest.spyOn(subscriptionService, 'deleteSubscription').mockImplementation(async () => undefined);
		const id = 'did:iota:1234';
		const req: any = {
			params: { channelAddress, id },
			user: { id: 'did:iota:1234' },
			body: subscriptionMock
		};
		await subscriptionRoutes.deleteSubscription(req, res, nextMock);

		expect(subscriptionService.deleteSubscription).toHaveBeenCalledWith(channelAddress, id);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith();
	});
});
