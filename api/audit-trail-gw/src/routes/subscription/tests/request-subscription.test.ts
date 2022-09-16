import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '..';
import { Subscription, AccessRights, SubscriptionType, ChannelType } from '@iota/is-shared-modules';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';
import base58 from 'bs58';

describe('test request subscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService;

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService();
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should call nextMock if no body is provided', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const req: any = {
			params: {},
			user: { id: undefined },
			body: undefined // no body
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalled();
		expect(nextMock).toHaveBeenCalledWith(new Error('could not request the subscription'));
	});

	it('should bad request if no id is provided', async () => {
		const req: any = {
			params: {},
			user: { id: undefined }, //no id,
			body: { accessRights: AccessRights.Read },
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	it('should return bad request since no channelAddress is provided', async () => {
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => ({} as any)); // already a subscription is found!
		const req: any = {
			params: {}, // no channelAddress
			user: { id: 'did:iota1234' },
			body: { accessRights: AccessRights.Read },
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	test.each([
		{ type: ChannelType.private, asymSharedKey: "somesharedKey", error: 'Please do not define an asym-shared-key.' },
		{ type: ChannelType.privatePlus, asymSharedKey: undefined, error: 'An asym-shared-key is required for privatePlus channels.' }])
		('should return error if channel type is privatePlus and no asymSharedKey is provided or if private and asymSharedKey is provided', async ({ type, asymSharedKey, error }) => {
			jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => null);
			jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => type)
			const req: any = {
				params: { channelAddress: 'testaddress' },
				user: { id: 'did:iota1234' },
				body: { accessRights: AccessRights.Read },
				query: { 'asym-shared-key': asymSharedKey }
			};

			await subscriptionRoutes.requestSubscription(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: error });
		});

	it('should return bad request since already a subscription is requested', async () => {
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => ({} as any)); // already a subscription is found!
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota1234' },
			body: { accessRights: AccessRights.Read },
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith('subscription already requested');
	});

	it('should not create a subscription since publicKey already used', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const foundSubscription: Subscription = {
			accessRights: AccessRights.Read,
			channelAddress: 'testaddress',
			id: 'did:iota:1234',
			isAuthorized: false,
			publicKey: 'testpublickey',
			subscriptionLink: 'testlink',
			type: SubscriptionType.Subscriber
		};
		const seed: string = undefined;
		const presharedKey: string = undefined;
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null);
		const getSubscriptionByPublicKeySpy = jest
			.spyOn(subscriptionService, 'getSubscriptionByPublicKey')
			.mockImplementation(async () => foundSubscription); // found some subscription so should return an error
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('teststate');
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => null);

		const requestSubscriptionSpy = jest.spyOn(streamsService, 'requestSubscription').mockImplementation(async () => ({
			subscriber: null,
			subscriptionLink: 'testlink',
			publicKey: 'testpublickey',
			seed: 'testseed'
		}));
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read },
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', false, seed, presharedKey);
		expect(getSubscriptionByPublicKeySpy).toHaveBeenCalledWith('testaddress', 'testpublickey');
		expect(exportSubscriptionSpy).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(new Error('public key already used'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not request the subscription'));
	});

	it('should create a subscription', async () => {
		const seed: string = undefined;
		const presharedKey: string = undefined;
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null);
		const subscriptionServiceAddSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
		const getSubscriptionByPublicKeySpy = jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockReturnValue(null);
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('teststate');
		const addChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'addChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => null);

		const requestSubscriptionSpy = jest.spyOn(streamsService, 'requestSubscription').mockImplementation(async () => ({
			subscriber: null,
			subscriptionLink: 'testlink',
			publicKey: 'testpublickey',
			seed: 'testseed'
		}));

		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read },
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		const expectedSubscription: Subscription = {
			accessRights: AccessRights.Read,
			channelAddress: 'testaddress',
			id: 'did:iota:1234',
			isAuthorized: false,
			publicKey: 'testpublickey',
			subscriptionLink: 'testlink',
			type: SubscriptionType.Subscriber
		};

		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', false, seed, presharedKey);
		expect(exportSubscriptionSpy).toHaveBeenCalled();
		expect(getSubscriptionByPublicKeySpy).toHaveBeenCalledWith('testaddress', 'testpublickey');
		expect(subscriptionServiceAddSpy).toHaveBeenCalledWith(expectedSubscription);
		expect(addChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith({ seed: 'testseed', subscriptionLink: 'testlink' });
	});

	it('should create a subscription using a preshared key', async () => {
		const seed: string = undefined;
		const presharedKey = 'd57921c36648c411db5048b652ec11b8';
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null);
		const subscriptionServiceAddSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
		const getSubscriptionByPublicKeySpy = jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockReturnValue(null);
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('teststate');
		const addChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'addChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => null);

		const requestSubscriptionSpy = jest.spyOn(streamsService, 'requestSubscription').mockImplementation(async () => ({
			subscriber: null,
			subscriptionLink: 'testlink',
			publicKey: 'testpublickey',
			seed: 'testseed',
			pskId: 'testpskid'
		}));

		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Audit, presharedKey },
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		const expectedSubscription: Subscription = {
			channelAddress: 'testaddress',
			id: 'did:iota:1234',
			publicKey: 'testpublickey',
			subscriptionLink: 'testlink',
			type: SubscriptionType.Subscriber,
			// differences for auditor
			accessRights: AccessRights.Audit, // access rights is audit
			keyloadLink: 'testaddress', // keyload link is channel address
			isAuthorized: true, // is directly authorized
			pskId: 'testpskid' // has preshared key
		};

		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', false, seed, presharedKey);
		expect(getSubscriptionByPublicKeySpy).toHaveBeenCalledWith('testaddress', 'testpublickey');
		expect(exportSubscriptionSpy).toHaveBeenCalled();
		expect(subscriptionServiceAddSpy).toHaveBeenCalledWith(expectedSubscription);
		expect(addChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith({ seed: 'testseed', subscriptionLink: 'testlink' });
	});

	it('should create a subscription using a preshared key but not having ReadAndWrite rights', async () => {
		const seed: string = undefined;
		const presharedKey = 'd57921c36648c411db5048b652ec11b8';
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null);
		const subscriptionServiceAddSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
		const getSubscriptionByPublicKeySpy = jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockReturnValue(null);
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('teststate');
		const addChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'addChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => null);

		const requestSubscriptionSpy = jest.spyOn(streamsService, 'requestSubscription').mockImplementation(async () => ({
			subscriber: null,
			subscriptionLink: 'testlink',
			publicKey: undefined, // no public key since uses presharedkey
			seed: 'testseed',
			pskId: 'testpskid'
		}));

		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.ReadAndWrite, presharedKey }, // should not consider these ReadAndWrite rights if subscription request has presharedKey
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		const expectedSubscription: Subscription = {
			channelAddress: 'testaddress',
			id: 'did:iota:1234',
			subscriptionLink: 'testlink',
			type: SubscriptionType.Subscriber,
			// differences for auditor
			accessRights: AccessRights.Audit, // access rights is always audit for presharedKey set
			keyloadLink: 'testaddress', // keyload link is channel address
			isAuthorized: true, // is directly authorized
			pskId: 'testpskid' // has preshared key
		};

		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', false, seed, presharedKey);
		expect(getSubscriptionByPublicKeySpy).not.toHaveBeenCalled(); // not called since it has no public key because of preshared key
		expect(exportSubscriptionSpy).toHaveBeenCalled();
		expect(subscriptionServiceAddSpy).toHaveBeenCalledWith(expectedSubscription);
		expect(addChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith({ seed: 'testseed', subscriptionLink: 'testlink' });
	});

	it('should create a subscription using a preshared key but not having ReadAndWrite rights', async () => {
		const seed: string = undefined;
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null);
		const subscriptionServiceAddSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
		const getSubscriptionByPublicKeySpy = jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockReturnValue(null);
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('teststate');
		const addChannelSubscriptionIdSpy = jest.spyOn(channelInfoService, 'addChannelSubscriberId').mockImplementation(async () => null);
		const getChannelInfoSpy = jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.public);

		const requestSubscriptionSpy = jest.spyOn(streamsService, 'requestSubscription').mockImplementation(async () => ({
			subscriber: null,
			subscriptionLink: 'testaddress',
			publicKey: 'mypublickey',
			seed: 'testseed'
		}));

		const req: any = {
			params: {
				channelAddress: 'testaddress'
			},
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.ReadAndWrite }, // should not consider these ReadAndWrite rights if subscription uses public channel
			query: {}
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		const expectedSubscription: Subscription = {
			channelAddress: 'testaddress',
			id: 'did:iota:1234',
			subscriptionLink: 'testaddress',
			publicKey: 'mypublickey',
			type: SubscriptionType.Subscriber,
			accessRights: AccessRights.Audit, // access rights is always audit if public channel
			keyloadLink: 'testaddress', // keyload link is channel address
			isAuthorized: true // is directly authorized
		};

		expect(getChannelInfoSpy).toHaveBeenCalledWith('testaddress');
		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', true, seed, undefined); // true since public channel
		expect(getSubscriptionByPublicKeySpy).toHaveBeenCalledWith('testaddress', 'mypublickey');
		expect(exportSubscriptionSpy).toHaveBeenCalled();
		expect(subscriptionServiceAddSpy).toHaveBeenCalledWith(expectedSubscription);
		expect(addChannelSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith({ seed: 'testseed', subscriptionLink: 'testaddress' });
	});

	it('should create a subscription for privatePlus channel', async () => {
		const seed: string = undefined;
		const presharedKey: string = undefined;
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null);
		const subscriptionServiceAddSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
		const getSubscriptionByPublicKeySpy = jest.spyOn(subscriptionService, 'getSubscriptionByPublicKey').mockReturnValue(null);
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue(('teststate'));
		const addChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'addChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.privatePlus);

		const requestSubscriptionSpy = jest.spyOn(streamsService, 'requestSubscription').mockImplementation(async () => ({
			subscriber: { id: 'did:iota:1234' } as any,
			subscriptionLink: 'testlink',
			publicKey: 'testpublickey',
			seed: 'testseed'
		}));

		const asymSharedKey = base58.encode(Buffer.from('anySharedKey'));
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read },
			query: { 'asym-shared-key': asymSharedKey }
		};

		await subscriptionRoutes.requestSubscription(req, res, nextMock);

		const expectedSubscription: Subscription = {
			accessRights: AccessRights.Read,
			channelAddress: 'testaddress',
			id: 'did:iota:1234',
			isAuthorized: false,
			publicKey: 'testpublickey',
			subscriptionLink: 'testlink',
			type: SubscriptionType.Subscriber
		};

		expect(requestSubscriptionSpy).toHaveBeenCalledWith('testaddress', false, seed, presharedKey);
		expect(exportSubscriptionSpy).toHaveBeenCalledWith({ id: 'did:iota:1234' }, asymSharedKey);
		expect(getSubscriptionByPublicKeySpy).toHaveBeenCalledWith('testaddress', 'testpublickey');
		expect(subscriptionServiceAddSpy).toHaveBeenCalledWith(expectedSubscription);
		expect(addChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		expect(res.send).toHaveBeenCalledWith({ seed: 'testseed', subscriptionLink: 'testlink' });
	});
});
