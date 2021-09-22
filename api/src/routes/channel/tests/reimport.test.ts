import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '..';
import { AccessRights } from '../../../models/schemas/subscription';
import { SubscriptionPool } from '../../../pools/subscription-pools';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { ChannelService } from '../../../services/channel-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { UserService } from '../../../services/user-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { TestUsersMock } from '../../../test/mocks/identities';
import { LoggerMock } from '../../../test/mocks/logger';
import * as ChannelDataDb from '../../../database/channel-data';

describe('test re-import route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelService: ChannelService, channelRoutes: ChannelRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService({} as any, '', LoggerMock);
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
		const subscriptionPool = new SubscriptionPool(streamsService, 20);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, subscriptionPool, config);
		channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, subscriptionPool, config);
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
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or identityId provided' });
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
		const loggerSpy = spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = spyOn(subscriptionService, 'getSubscription').and.returnValue(null); // no subscription found

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
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
		const loggerSpy = spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = spyOn(subscriptionService, 'getSubscription').and.returnValue({
			keyloadLink: 'testlink',
			publicKey: 'testkey',
			accessRights: AccessRights.Write // wrong access rights
		});

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
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
		const loggerSpy = spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = spyOn(subscriptionService, 'getSubscription').and.returnValue({
			keyloadLink: 'testlink',
			publicKey: 'testkey',
			accessRights: AccessRights.Write // wrong access rights
		});

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
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
		const getSubscriptionSpy = spyOn(subscriptionService, 'getSubscription').and.returnValue({
			keyloadLink: 'testlink',
			publicKey: 'testkey', // different public key as newSub
			accessRights: AccessRights.Read
		});
		const loggerSpy = spyOn(LoggerMock, 'error');
		const newSub = { clone: () => newSub, get_public_key: () => 'differenttestkey' }; // public key is different as the one in the prev. subscription
		const resetStateSpy = spyOn(streamsService, 'resetState').and.returnValue(newSub);

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(resetStateSpy).toHaveBeenCalledWith(channelAddress, seed, false);
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
		const loggerSpy = spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = spyOn(subscriptionService, 'getSubscription').and.returnValue({
			keyloadLink: 'testlink',
			publicKey: 'testkey', // same public key as in newSub
			accessRights: AccessRights.Read
		});
		const newSub = { clone: () => newSub, get_public_key: () => 'testkey' }; // same public key
		const resetStateSpy = spyOn(streamsService, 'resetState').and.returnValue(newSub);
		const removeChannelDataSpy = spyOn(ChannelDataDb, 'removeChannelData');
		const fetchLogsSpy = spyOn(channelService, 'fetchLogs');

		await channelRoutes.reimport(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(resetStateSpy).toHaveBeenCalledWith(channelAddress, seed, false);
		expect(removeChannelDataSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(fetchLogsSpy).toHaveBeenCalledWith(channelAddress, user.identityId, newSub);
		expect(loggerSpy).not.toHaveBeenCalled();
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
	});
});
