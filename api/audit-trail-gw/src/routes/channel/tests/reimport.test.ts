import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '..';
import { AccessRights } from '@iota/is-shared-modules/lib/models/schemas/subscription';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { ChannelService } from '../../../services/channel-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { TestUsersMock } from '../../../test/mocks/identities';
import { LoggerMock } from '../../../test/mocks/logger';
import * as ChannelDataDb from '../../../database/channel-data';
import { SubscriberMock } from '../../../test/mocks/streams';
import { Subscription } from '@iota/is-shared-modules/lib/models/types/subscription';
import { Subscriber } from '@iota/streams/node/streams_wasm';

describe('test re-import route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelService: ChannelService, channelRoutes: ChannelRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService;

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService();
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, config, LoggerMock);
		channelRoutes = new ChannelRoutes(channelService, LoggerMock);

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
			body: {}
		};

		await channelRoutes.reimport(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	it('should return bad request if no seed is provided', async () => {
		const req: any = {
			params: { channelAddress: '123456' },
			user: TestUsersMock[0],
			body: {}
		};

		await channelRoutes.reimport(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no seed provided' });
	});

	it('should throw an error since no subscription was found', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed: 'testseeddontusethis' }
		};
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
			body: { seed: 'testseeddontusethis' }
		};
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
			body: { seed: 'testseeddontusethis' }
		};
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
			body: { seed }
		};
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey', // different public key as newSub
					accessRights: AccessRights.Read,
					state: 'teststate'
				} as Subscription)
		);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const newSub = { clone: () => newSub, get_public_key: () => 'differenttestkey' }; // public key is different as the one in the prev. subscription
		const resetStateSpy = jest.spyOn(streamsService, 'resetState').mockImplementation(async () => newSub as Subscriber);
		const importSubscriptionSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => SubscriberMock);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(importSubscriptionSpy).toHaveBeenCalledWith('teststate', false);
		expect(resetStateSpy).toHaveBeenCalledWith(channelAddress, SubscriberMock, false);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('wrong seed inserted'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not reimport channel data'));
	});

	it('should delete logs and reimport messages', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const seed = 'testseeddontusethis';
		const req: any = {
			params: { channelAddress },
			user,
			body: { seed }
		};
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey', // same public key as in newSub
					accessRights: AccessRights.Read,
					state: 'teststate'
				} as Subscription)
		);
		const newSub = { clone: () => newSub, get_public_key: () => 'testkey' }; // same public key
		const resetStateSpy = jest.spyOn(streamsService, 'resetState').mockImplementation(async () => newSub as Subscriber);
		const removeChannelDataSpy = jest.spyOn(ChannelDataDb, 'removeChannelData').mockImplementation(async () => null);
		const fetchLogsSpy = jest.spyOn(channelService, 'fetchLogs').mockImplementation(async () => null);
		const importSubscriptionSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => SubscriberMock);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(importSubscriptionSpy).toHaveBeenCalledWith('teststate', false);
		expect(resetStateSpy).toHaveBeenCalledWith(channelAddress, SubscriberMock, false);
		expect(removeChannelDataSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(fetchLogsSpy).toHaveBeenCalledWith(channelAddress, user.id, newSub);
		expect(loggerSpy).not.toHaveBeenCalled();
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});
});
