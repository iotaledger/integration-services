import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '..';
import { AccessRights, SubscriptionType } from '../../../models/schemas/subscription';
import { Subscription } from '../../../models/types/subscription';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { ChannelService } from '../../../services/channel-service';
import { StreamsMessage, StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { UserService } from '../../../services/user-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { TestUsersMock } from '../../../test/mocks/identities';
import { LoggerMock } from '../../../test/mocks/logger';
import { AuthorMock } from '../../../test/mocks/streams';

describe('test validate route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelService: ChannelService, channelRoutes: ChannelRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;

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
		const config = StreamsConfigMock;
		userService = new UserService({} as any, '', LoggerMock);
		streamsService = new StreamsService(config, LoggerMock);
		channelInfoService = new ChannelInfoService(userService);
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

		await channelRoutes.validateLogs(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or identityId provided' });
	});

	it('should return bad request if no channelLogs are provided', async () => {
		const req: any = {
			params: { channelAddress: '123456' },
			user: TestUsersMock[0],
			body: [] // empty channelLogs
		};

		await channelRoutes.validateLogs(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no logs provided' });
	});

	it('should throw an error since no subscription was found', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs
		};
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null); // no subscription found

		await channelRoutes.validateLogs(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not validate the channel data'));
	});

	it('should throw an error since subscription has no read right', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs
		};
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					state: AuthorMock.state,
					accessRights: AccessRights.Write // wrong access rights
				} as Subscription)
		);

		await channelRoutes.validateLogs(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed to validate the logs from the channel'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not validate the channel data'));
	});

	it('should throw an error since no streams sub is found', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs
		};
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					accessRights: AccessRights.Read,
					type: SubscriptionType.Author,
					state: AuthorMock.state
				} as Subscription)
		);
		const getSubSpy = jest.spyOn(streamsService, 'importSubscription').mockReturnValue(null); // no subscriber found
		const loggerSpy = jest.spyOn(LoggerMock, 'error');

		await channelRoutes.validateLogs(req, res, nextMock);

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(getSubSpy).toHaveBeenCalledWith(AuthorMock.state, true);
		expect(loggerSpy).toHaveBeenCalledWith(
			new Error(
				'no author/subscriber found with channelAddress: 123456 and identityId: did:iota:6cTkp3gCV3yifiGDHUK4x1omXb6yFBTRg7NS2x3kBDUm'
			)
		);
		expect(nextMock).toHaveBeenCalledWith(new Error('could not validate the channel data'));
	});

	it('should validate the logs', async () => {
		const channelAddress = '123456';
		const user = TestUsersMock[0];
		const req: any = {
			params: { channelAddress },
			user,
			body: logs
		};
		const getSubscriptionSpy = jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(
			async () =>
				({
					keyloadLink: 'testlink',
					publicKey: 'testkey',
					accessRights: AccessRights.Read,
					type: SubscriptionType.Author,
					state: AuthorMock.state
				} as Subscription)
		);
		const importSubscriptionSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => AuthorMock as any);

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

		expect(getSubscriptionSpy).toHaveBeenCalledWith(channelAddress, user.identityId);
		expect(getMessageSpy).toHaveBeenCalledTimes(3);
		expect(importSubscriptionSpy).toHaveBeenCalledWith(AuthorMock.state, true);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith(expectedValidatedLogs);
	});
});
