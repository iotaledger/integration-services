import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '..';
import { AccessRights, ChannelType, Subscription } from '@iota/is-shared-modules';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { ChannelService } from '../../../services/channel-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { ConfigMock } from '../../../test/mocks/config';
import { TestUsersMock } from '../../../test/mocks/identities';
import { LoggerMock } from '../../../test/mocks/logger';
import * as ChannelDataDb from '../../../database/channel-data';
import { SubscriberMock } from '../../../test/mocks/streams';
import { Subscriber } from '@iota/streams/node/streams_wasm';

describe('test re-import route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelService: ChannelService, channelRoutes: ChannelRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService;

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = ConfigMock;
		streamsService = new StreamsService(config.streamsConfig, LoggerMock);
		channelInfoService = new ChannelInfoService();
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config.streamsConfig);
		channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, config, LoggerMock);
		channelRoutes = new ChannelRoutes(channelService, channelInfoService, LoggerMock, {
			ssiBridgeApiKey: ConfigMock.ssiBridgeApiKey,
			ssiBridgeUrl: ConfigMock.ssiBridgeUrl
		});

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request if no channelAddress is provided', async () => {
		const req: any = {
			params: {},
			user: TestUsersMock[0],
			body: {},
			query: {}
		};

		await channelRoutes.reimport(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	test.each([
		{ type: ChannelType.private, asymSharedKey: 'somesharedKey', error: 'Please do not define an asym-shared-key.' },
		{ type: ChannelType.privatePlus, asymSharedKey: undefined, error: 'An asym-shared-key is required for privatePlus channels.' }
	])(
		'should return error if channel type is privatePlus and no asymSharedKey is provided or if private and asymSharedKey is provided',
		async ({ type, asymSharedKey, error }) => {
			jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => type);
			const req: any = {
				params: { channelAddress: '123456' },
				user: TestUsersMock[0],
				body: { seed: 'testseeddontusethis' },
				query: { 'asym-shared-key': asymSharedKey }
			};

			await channelRoutes.validateLogs(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: error });
		}
	);

	it('should throw an error since no subscription was found', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed: 'testseeddontusethis' },
			query: {}
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null); // no subscription found

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not reimport channel data'));
	});

	it('should throw an error since subscription has no read right', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed: 'testseeddontusethis' },
			query: {}
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					accessRights: AccessRights.Write // wrong access rights
				} as Subscription)
		);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed to reimport the logs from the channel'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not reimport channel data'));
	});

	it('should throw an error since subscription has no read right', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed: 'testseeddontusethis' },
			query: {}
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					accessRights: AccessRights.Write // wrong access rights
				} as Subscription)
		);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed to reimport the logs from the channel'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not reimport channel data'));
	});

	it('should throw an error since seed is different from existing', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const seed = 'testseeddontusethis';
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed },
			query: {}
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private);
		const getSubscriptionStateSpy = jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementation(async () => 'teststate');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey', // different public key as newSub
					accessRights: AccessRights.Read
				} as Subscription)
		);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const newSub = { clone: () => newSub, get_public_key: () => 'differenttestkey' }; // public key is different as the one in the prev. subscription
		const resetStateSpy = jest.spyOn(streamsService, 'resetState').mockImplementation(async () => newSub as Subscriber);
		const importSubscriptionSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => SubscriberMock);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(getSubscriptionStateSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(importSubscriptionSpy).toHaveBeenCalledWith('teststate', false, ConfigMock.streamsConfig.password);
		expect(resetStateSpy).toHaveBeenCalledWith(channelAddress, SubscriberMock, false);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('wrong seed inserted'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not reimport channel data'));
	});

	test.each([
		{ type: ChannelType.private, asymSharedKey: undefined, password: ConfigMock.streamsConfig.password },
		{ type: ChannelType.privatePlus, asymSharedKey: 'someAsymSharedKey', password: 'someAsymSharedKey' } // uses asymSharedKey instead of ConfigMock.streamsConfig.password
	])('should delete logs and reimport messages for private and privatePlus channels', async ({ type, asymSharedKey, password }) => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const seed = 'testseeddontusethis';
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed },
			query: { 'asym-shared-key': asymSharedKey }
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => type);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionStateSpy = jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementation(async () => 'teststate');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey', // same public key as in newSub
					accessRights: AccessRights.Read
				} as Subscription)
		);
		const newSub = { clone: () => newSub, get_public_key: () => 'testkey' }; // same public key
		const resetStateSpy = jest.spyOn(streamsService, 'resetState').mockImplementation(async () => newSub as Subscriber);
		const removeChannelDataSpy = jest.spyOn(ChannelDataDb, 'removeChannelData').mockImplementation(async () => null);
		const fetchLogsSpy = jest.spyOn(channelService, 'fetchLogs').mockImplementation(async () => null);
		const importSubscriptionSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => SubscriberMock);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(getSubscriptionStateSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(importSubscriptionSpy).toHaveBeenCalledWith('teststate', false, password);
		expect(resetStateSpy).toHaveBeenCalledWith(channelAddress, SubscriberMock, false);
		expect(removeChannelDataSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(fetchLogsSpy).toHaveBeenCalledWith(channelAddress, user.id, newSub, password);
		expect(loggerSpy).not.toHaveBeenCalled();
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});
});
