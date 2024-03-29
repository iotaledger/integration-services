import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '..';
import { AccessRights, SubscriptionType, Subscription, ChannelType } from '@iota/is-shared-modules';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { ChannelService } from '../../../services/channel-service';
import { StreamsMessage, StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { StreamsConfigMock, ConfigMock } from '../../../test/mocks/config';
import { TestUsersMock } from '../../../test/mocks/identities';
import { LoggerMock } from '../../../test/mocks/logger';
import { AuthorMock } from '../../../test/mocks/streams';

describe('test validate route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelService: ChannelService, channelRoutes: ChannelRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService;

	const logs = [
		{
			link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4',
			log: {
				created: '2021-09-06T14:30:08+02:00',
				type: 'author-test',
				metadata: {
					somedata: 22
				},
				publicPayload: {
					data: 'testdata123'
				},
				payload: 'I am a string from the author'
			},
			messageId: '4567570d36e11dc377faee93c8c182b0b44bcd816b4fd0e48ec85a8e8a49f69d',
			imported: '2021-09-06T14:30:14+02:00'
		},
		{
			link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1',
			log: {
				created: '2021-09-06T14:30:05+02:00',
				type: 'author-test',
				metadata: {
					somedata: 22
				},
				publicPayload: {
					data: 'testdata123'
				},
				payload: 'I am a string from the author'
			},
			messageId: '281ff5b9eea55c8eed82bef64b83f0dfe7bc175677807266d28fd900a60ac26b',
			imported: '2021-09-06T14:30:07+02:00'
		},
		{
			link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9',
			log: {
				created: '2021-09-06T14:27:54+02:00',
				type: 'author-test',
				metadata: {
					somedata: 22
				},
				publicPayload: {
					publicData: 'testdata123'
				},
				payload: 'I am a string from the author'
			},
			messageId: '1a6bca1cae3b7f043fbce1eeb4a95b82ba70af4db2c1cdc8f149f55f79ca084b',
			imported: '2021-09-06T14:27:58+02:00'
		}
	];

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

		await channelRoutes.validateLogs(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
	});

	it('should return bad request if no channelLogs are provided', async () => {
		const req: any = {
			params: { channelAddress: '123456' },
			user: TestUsersMock[0],
			body: [], // empty channelLogs
			query: {}
		};

		await channelRoutes.validateLogs(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no logs provided' });
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
				body: logs,
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
			body: logs,
			query: {}
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null); // no subscription found

		await channelRoutes.validateLogs(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not validate the channel data'));
	});

	it('should throw an error since subscription has no read right', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs,
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

		await channelRoutes.validateLogs(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed to validate the logs from the channel'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not validate the channel data'));
	});

	it('should throw an error since no streams sub is found', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs,
			query: {}
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private);
		const getSubscriptionStateSpy = jest
			.spyOn(subscriptionService, 'getSubscriptionState')
			.mockImplementationOnce(async () => 'someteststate');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					accessRights: AccessRights.Read,
					type: SubscriptionType.Author
				} as Subscription)
		);
		const getSubSpy = jest.spyOn(streamsService, 'importSubscription').mockReturnValue(null); // no subscriber found
		const loggerSpy = jest.spyOn(LoggerMock, 'error');

		await channelRoutes.validateLogs(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(getSubscriptionStateSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(getSubSpy).toHaveBeenCalledWith('someteststate', true, StreamsConfigMock.password);
		expect(loggerSpy).toHaveBeenCalledWith(
			new Error('no author/subscriber found with channelAddress: 123456 and id: did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm')
		);
		expect(nextMock).toHaveBeenCalledWith(new Error('could not validate the channel data'));
	});

	test.each([
		{ type: ChannelType.private, asymSharedKey: undefined, password: StreamsConfigMock.password },
		{ type: ChannelType.privatePlus, asymSharedKey: 'someAsymSharedKey', password: 'someAsymSharedKey' } // uses asymSharedKey instead of ConfigMock.streamsConfig.password
	])('should validate the logs for private and privatePlus channels', async ({ type, asymSharedKey, password }) => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs,
			query: { 'asym-shared-key': asymSharedKey }
		};
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => type);
		const getSubscriptionStateSpy = jest
			.spyOn(subscriptionService, 'getSubscriptionState')
			.mockImplementationOnce(async () => 'someteststate');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					accessRights: AccessRights.Read,
					type: SubscriptionType.Author
				} as Subscription)
		);
		const importSubscriptionSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => AuthorMock);

		const tangleMessage = (index: number): StreamsMessage => ({
			maskedPayload: { data: logs[index].log.payload },
			publicPayload: {
				data: logs[index].log.publicPayload,
				type: logs[index].log.type,
				metadata: logs[index].log.metadata,
				created: logs[index].log.created
			},
			link: logs[index].link,
			messageId: logs[index].messageId
		});
		// TODO
		const getMessageSpy = jest
			.spyOn(streamsService, 'getMessage')
			.mockImplementationOnce(async () => tangleMessage(0))
			.mockImplementationOnce(async () => tangleMessage(1))
			.mockImplementationOnce(async () => tangleMessage(2));

		await channelRoutes.validateLogs(req, res, nextMock);

		const expectedValidatedLogs = [
			{ isValid: true, link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:c2bf8e1ccc98cb7b5ba286c4' },
			{ isValid: true, link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:9a52fdce3e7ee09dcce3a6e1' },
			{ isValid: true, link: 'c477ad1063fb6543522fc97026e813387e5ad939dfa3a2d413a6b881b338c7910000000000000000:55c9c94f5a485a8911b3afb9' }
		];

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(getSubscriptionStateSpy).toHaveBeenCalledWith(channelAddress, user.id);
		expect(getMessageSpy).toHaveBeenCalledTimes(3);
		expect(importSubscriptionSpy).toHaveBeenCalledWith('someteststate', true, password);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith(expectedValidatedLogs);
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});
});
