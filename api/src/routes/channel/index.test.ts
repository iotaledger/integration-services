import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '.';
import { ChannelInfo } from '../../models/types/channel-info';
import { Subscription } from '../../models/types/subscription';
import { AccessRights, SubscriptionType } from '../../models/schemas/subscription';
import { SubscriptionPool } from '../../pools/subscription-pools';
import { ChannelInfoService } from '../../services/channel-info-service';
import { ChannelService } from '../../services/channel-service';
import { StreamsService } from '../../services/streams-service';
import { SubscriptionService } from '../../services/subscription-service';
import { UserService } from '../../services/user-service';
import { StreamsConfigMock } from '../../test/mocks/config';
import { LoggerMock } from '../../test/mocks/logger';

describe('test channel routes', () => {
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
		const subscriptionPool = new SubscriptionPool(streamsService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, subscriptionPool, config);
		channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, subscriptionPool, config);
		channelRoutes = new ChannelRoutes(channelService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test create channel route', () => {
		it('should call nextMock if no body is provided', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const req: any = {
				params: {},
				user: { identityId: undefined },
				body: undefined // no body
			};

			await channelRoutes.createChannel(req, res, nextMock);
			expect(loggerSpy).toHaveBeenCalledWith(new Error("Cannot read property 'topics' of undefined"));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the channel'));
		});

		it('should bad request if no identityId is provided', async () => {
			const req: any = {
				params: {},
				user: { identityId: undefined }, //no identityId,
				body: {}
			};

			await channelRoutes.createChannel(req, res, nextMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should create and return a channel for the user', async () => {
			const req: any = {
				params: {},
				user: { identityId: 'did:iota:1234' },
				body: { topics: [], seed: 'verysecretseed', encrypted: true }
			};

			const expectedSubscription: Subscription = {
				accessRights: AccessRights.ReadAndWrite,
				channelAddress: '1234234234',
				keyloadLink: '1234234234',
				isAuthorized: true,
				seed: 'verysecretseed',
				state: 'uint8array string of subscription state',
				subscriptionLink: '1234234234',
				type: SubscriptionType.Author,
				identityId: 'did:iota:1234',
				publicKey: null
			};
			const expectedChannelInfo: ChannelInfo = {
				authorId: 'did:iota:1234',
				channelAddress: '1234234234',
				latestLink: '1234234234',
				topics: [],
				encrypted: true
			};

			const exportSubscriptionSpy = spyOn(streamsService, 'exportSubscription').and.returnValue('uint8array string of subscription state');
			const createSpy = spyOn(streamsService, 'create').and.returnValue({ seed: 'verysecretseed', author: {}, channelAddress: '1234234234' });
			const addSubscriptionSpy = spyOn(subscriptionService, 'addSubscription');
			const addChannelInfoSpy = spyOn(channelInfoService, 'addChannelInfo');

			await channelRoutes.createChannel(req, res, nextMock);

			expect(createSpy).toHaveBeenCalledWith('verysecretseed');
			expect(exportSubscriptionSpy).toHaveBeenCalledWith({}, StreamsConfigMock.statePassword);
			expect(addSubscriptionSpy).toHaveBeenCalledWith(expectedSubscription);
			expect(addChannelInfoSpy).toHaveBeenCalledWith(expectedChannelInfo);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			// TODO#105 author should be the exported string not object
			expect(res.send).toHaveBeenCalledWith({ author: {}, channelAddress: '1234234234', seed: 'verysecretseed' });
		});
	});

	describe('test getLogs channel route', () => {
		it('should bad request if no channelAddress is provided', async () => {
			const req: any = {
				params: { channelAddress: '12345' },
				user: { identityId: undefined }, //no identityId,
				body: {}
			};

			await channelRoutes.getLogs(req, res, nextMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should bad request if no identityId is provided', async () => {
			const req: any = {
				params: {}, // no channelAddress
				user: { identityId: 'did:iota:1234' },
				body: {}
			};

			await channelRoutes.getLogs(req, res, nextMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});
	});
});
