import { ChannelInfoPersistence, ChannelInfo, ChannelInfoSearch, getDateFromString, getDateStringFromDate } from '@iota/is-shared-modules';
import { ChannelInfoRoutes } from '.';
import * as ChannelInfoDb from '../../database/channel-info';
import { ChannelInfoService } from '../../services/channel-info-service';
import { AuthorizationService } from '../../services/authorization-service';
import { LoggerMock } from '../../test/mocks/logger';
import { StatusCodes } from 'http-status-codes';

describe('test Search channel', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelInfoRoutes: ChannelInfoRoutes, channelInfoService: ChannelInfoService;
	beforeEach(() => {
		sendMock = jest.fn().mockReturnThis();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		channelInfoService = new ChannelInfoService();
		const authorizationService = new AuthorizationService();
		channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	test.each([
		{ authorId: "did:iota:1234", hidden: true, visibilityList: [{ id: "did:iota:54321" }] },
		{ authorId: "did:iota:54321", hidden: false, visibilityList: [] },
		{ authorId: "did:iota:54321", hidden: true, empty: true }
	])(
		"1: return channel because request is author" +
		"2: return channel with empty visbilityList because not author" +
		"3. return empty list because channel is hidden and requester is not author.",
		async (obj) => {
			const expectedChannelInfoSearch: ChannelInfoSearch = {
				authorId: "did:iota:1234",
				subscriberId: 'did:iota:4321',
				requestedSubscriptionId: 'did:iota:1432',
				name: 'test-channel',
				topicType: 'test-topic',
				topicSource: 'test-source',
				limit: 1,
				index: 1,
				ascending: true,
				hidden: obj.hidden,
				visibilityList: [{ id: "did:iota:54321" }],
				created: getDateFromString('2021-02-12T14:58:05+01:00'),
				latestMessage: getDateFromString('2021-02-12T14:58:05+01:00')
			};
			const searchChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'searchChannelInfo').mockImplementation(async () => [{ ...expectedChannelInfoSearch, channelAddress: "channelAddress" } as ChannelInfoPersistence]);

			const req: any = {
				user: { id: obj.authorId },
				params: {},
				query: {
					'author-id': "did:iota:1234",
					'subscriber-id': 'did:iota:4321',
					'requested-subscription-id': 'did:iota:1432',
					name: 'test-channel',
					'topic-type': 'test-topic',
					'topic-source': 'test-source',
					limit: '1',
					index: '1',
					created: '2021-02-12T14:58:05+01:00',
					'latest-message': '2021-02-12T14:58:05+01:00',
					asc: 'true',
					hidden: new Boolean(obj.hidden).toString()
				},
				body: {
					visibilityList: [{ id: "did:iota:54321" }]
				}
			};

			await channelInfoRoutes.searchChannelInfo(req, res, nextMock);


			expect(searchChannelInfoSpy).toHaveBeenCalledWith(expectedChannelInfoSearch);
			expect(res.send).toHaveBeenCalledWith(
				!obj?.empty
					? [{
						"authorId": "did:iota:1234",
						"channelAddress": "channelAddress",
						"created": "2021-02-12T14:58:05+01:00",
						"description": undefined,
						"hidden": obj.hidden,
						"latestMessage": "2021-02-12T14:58:05+01:00",
						"name": "test-channel",
						"requestedSubscriptionIds": [],
						"subscriberIds": [],
						"topics": undefined,
						"type": undefined,
						"visibilityList": obj.visibilityList
					}]
					: [])

		})

	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
});

describe('test GET channelInfo', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelInfoRoutes: ChannelInfoRoutes, channelInfoService: ChannelInfoService;

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		channelInfoService = new ChannelInfoService();
		const authorizationService = new AuthorizationService();
		channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, LoggerMock);
		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request if no address is given as parameter', async () => {
		const req: any = {
			params: {},
			body: null
		};

		await channelInfoRoutes.getChannelInfo(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress provided' });
	});

	test.each([
		{ author: 'test-author2', hidden: true, visibilityList: [{ id: "12345" }] },
		{ author: 'test-author2', hidden: false, visibilityList: [{ id: "12345" }] },
		{ author: 'test-author3', hidden: false, visibilityList: [] },
		{ author: 'test-author3', hidden: true, error: true }
	])
		(
			'1: should return channel' +
			'2: should return channel with visbilityList if hidden is false and requester is author'+
			'3: should return channel with empty visbilityList because not author' +
			'4: should throw error because channel is hidden and requester is not author',
			async (obj) => {
				const date = getDateFromString('2021-02-09T00:00:00+01:00');
				const channelInfo: ChannelInfoPersistence = {
					created: date,
					authorId: 'test-author2',
					name: 'test-name',
					topics: [
						{
							source: 'test',
							type: 'test-type'
						}
					],
					latestMessage: null,
					channelAddress: 'test-address3',
					hidden: obj.hidden,
					visibilityList: [{ id: "12345" }]
				};
				const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => channelInfo);
				const req: any = {
					user: { id: obj.author },
					params: { channelAddress: 'test-address3' },
					body: null
				};

				await channelInfoRoutes.getChannelInfo(req, res, nextMock);

				expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
				!obj.error
					? expect(sendMock).toHaveBeenCalledWith(
						{
							authorId: 'test-author2',
							name: 'test-name',
							channelAddress: 'test-address3',
							created: getDateStringFromDate(date),
							latestMessage: null,
							subscriberIds: [],
							requestedSubscriptionIds: [],
							topics: [{ source: 'test', type: 'test-type' }],
							hidden: obj.hidden,
							visibilityList: obj.visibilityList
						})
					: expect(nextMock).toHaveBeenCalledWith(new Error('could not get the channel info'))
			});

	it('should call next(err) if an error occurs', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => {
			throw new Error('Test error');
		});
		const req: any = {
			params: { channelAddress: 'test-address' },
			body: null
		};

		await channelInfoRoutes.getChannelInfo(req, res, nextMock);

		expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(sendMock).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not get the channel info'));
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
});

describe('test POST channelInfo', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelInfoRoutes: ChannelInfoRoutes, channelInfoService: ChannelInfoService;

	const validBody: ChannelInfo = {
		authorId: 'test-author2',
		name: 'test-name',
		channelAddress: 'test-address3',
		created: '2021-03-26T13:43:03+01:00',
		latestMessage: null,
		topics: [{ source: 'test', type: 'test-type' }],
		hidden: true,
		visibilityList: [{id: "did:iota:54321"}]
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		channelInfoService = new ChannelInfoService();
		const authorizationService = new AuthorizationService();
		channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request if no valid body is given', async () => {
		const req: any = {
			params: {},
			body: null
		};
		await channelInfoRoutes.addChannelInfo(req, res, nextMock);
		expect(nextMock).toHaveBeenCalled();
	});

	it('should return 404 since no channel added', async () => {
		const addChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'addChannelInfo').mockImplementation(async () => ({ result: { n: 0 } } as any));

		const req: any = {
			user: { id: validBody.authorId },
			params: {},
			body: validBody
		};

		await channelInfoRoutes.addChannelInfo(req, res, nextMock);

		expect(addChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(res.send).toHaveBeenCalledWith({ error: 'could not add channel info' });
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('should not add channel info since request identityid does not match', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const addChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'addChannelInfo').mockImplementation(async () => ({ result: { n: 1 } } as any));

		const req: any = {
			user: { id: 'did:iota:123456' },
			params: {},
			body: validBody
		};

		await channelInfoRoutes.addChannelInfo(req, res, nextMock);

		expect(addChannelInfoSpy).toHaveBeenCalledTimes(0);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not add the channel info'));
	});

	it('should add channel info since request identityid does match', async () => {
		const addChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'addChannelInfo').mockImplementation(async () => ({ result: { n: 1 } } as any));

		const req: any = {
			user: { id: validBody.authorId },
			params: {},
			body: validBody
		};

		await channelInfoRoutes.addChannelInfo(req, res, nextMock);

		expect(addChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(sendStatusMock).toHaveBeenCalledWith(201);
	});
	it('should call next(err) if an error occurs', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const addChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'addChannelInfo').mockImplementation(async () => {
			throw new Error('Test error');
		});
		const req: any = {
			user: { id: validBody.authorId },
			params: {},
			body: validBody
		};
		await channelInfoRoutes.addChannelInfo(req, res, nextMock);

		expect(addChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(sendMock).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not add the channel info'));
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
});

describe('test PUT channelInfo', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelInfoRoutes: ChannelInfoRoutes, channelInfoService: ChannelInfoService, getChannelInfoSpy: any;

	const validBody: ChannelInfo = {
		authorId: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
		name: 'test-name',
		channelAddress: 'test-address3',
		created: '2021-03-26T13:43:03+01:00',
		latestMessage: null,
		topics: [{ source: 'test', type: 'test-type' }],
		hidden: true,
		visibilityList: [{ id: "did:iota:12345" }]
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		channelInfoService = new ChannelInfoService();
		const authorizationService = new AuthorizationService();
		channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, LoggerMock);
		getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => ({
			created: getDateFromString('2021-03-26T16:13:11+01:00'),
			authorId: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
			name: 'test-name',
			subscriberIds: [],
			topics: [
				{
					source: 'device',
					type: 'temperatures'
				}
			],
			latestMessage: null,
			channelAddress: 'test-address-c3-device'
		}));

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request if no valid body is given', async () => {
		const req: any = {
			params: {},
			body: null
		};
		await channelInfoRoutes.updateChannelInfo(req, res, nextMock);
		expect(nextMock).toHaveBeenCalled();
	});

	it('should return 404 since no channel updated', async () => {
		const updateChannelTopicSpy = jest
			.spyOn(ChannelInfoDb, 'updateChannel')
			.mockImplementation(async () => ({ result: { n: 0 } } as any));

		const req: any = {
			user: { id: validBody.authorId },
			params: {},
			body: validBody
		};

		await channelInfoRoutes.updateChannelInfo(req, res, nextMock);

		expect(updateChannelTopicSpy).toHaveBeenCalledTimes(1);
		expect(res.send).toHaveBeenCalledWith({ error: 'No channel info found to update!' });
		expect(res.status).toHaveBeenCalledWith(404);
	});

	it('should update expected channel info', async () => {
		const updateChannelTopicSpy = jest
			.spyOn(ChannelInfoDb, 'updateChannel')
			.mockImplementation(async () => ({ result: { n: 1 } } as any));

		const req: any = {
			user: { id: validBody.authorId },
			params: {},
			body: validBody
		};

		await channelInfoRoutes.updateChannelInfo(req, res, nextMock);
		expect(getChannelInfoSpy).toHaveBeenCalled();
		expect(updateChannelTopicSpy).toHaveBeenCalledTimes(1);
		expect(sendStatusMock).toHaveBeenCalledWith(200);
	});

	it('should not update expected channel info since not allowed', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const updateChannelTopicSpy = jest
			.spyOn(ChannelInfoDb, 'updateChannel')
			.mockImplementation(async () => ({ result: { n: 1 } } as any));

		const req: any = {
			user: { id: 'did:iota:123456' }, // different id as authorId
			params: {},
			body: validBody
		};

		await channelInfoRoutes.updateChannelInfo(req, res, nextMock);
		expect(getChannelInfoSpy).toHaveBeenCalled();
		expect(updateChannelTopicSpy).toHaveBeenCalledTimes(0);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not update the channel info'));
	});

	it('should call next(err) if an error occurs', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const updateChannelTopicSpy = jest.spyOn(ChannelInfoDb, 'updateChannel').mockImplementation(async () => {
			throw new Error('Test error');
		});
		const req: any = {
			user: { id: validBody.authorId },
			params: {},
			body: validBody
		};
		await channelInfoRoutes.updateChannelInfo(req, res, nextMock);

		expect(updateChannelTopicSpy).toHaveBeenCalledTimes(1);
		expect(sendMock).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not update the channel info'));
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
});

describe('test DELETE channelInfo', () => {
	const channel = {
		created: getDateFromString('2021-03-26T16:13:11+01:00'),
		authorId: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu',
		name: 'test-name',
		topics: [
			{
				source: 'device',
				type: 'temperatures'
			}
		],
		channelAddress: 'test-address-c3-device'
	};
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let channelInfoRoutes: ChannelInfoRoutes, channelInfoService: ChannelInfoService;

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		channelInfoService = new ChannelInfoService();
		const authorizationService = new AuthorizationService();
		channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should return bad request if no address is given as parameter', async () => {
		const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => null);
		const req: any = {
			params: {},
			body: null
		};
		await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);
		expect(getChannelInfoSpy).toHaveBeenCalledTimes(0);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress provided' });
	});

	it('should not be able to parse the channel since it is no valid channel', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const deleteChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'deleteChannelInfo').mockImplementation(async () => null);
		const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => ({} as any)); // no valid channel

		const req: any = {
			id: 'did:iota:1234567', // wrong identityid
			params: { channelAddress: 'test-address' },
			body: null
		};

		await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

		expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(0);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('channel does not exist!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not delete the channel info'));
	});

	it('should return error since channel is not found', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const deleteChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'deleteChannelInfo').mockImplementation(async () => null);
		const getChannelInfoSpy = jest.spyOn(channelInfoService, 'getChannelInfo').mockReturnValue(null); // channel is null

		const req: any = {
			id: 'did:iota:1234567', // wrong identityid
			params: { channelAddress: 'test-address' },
			body: null
		};

		await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

		expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(0);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('channel does not exist!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not delete the channel info'));
	});

	it('should not delete the expected channel info since he is not authorized', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const deleteChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'deleteChannelInfo').mockImplementation(async () => null);
		const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => channel);

		const req: any = {
			user: { id: 'did:iota:1234567' }, // wrong identityid
			params: { channelAddress: 'test-address' },
			body: null
		};

		await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

		expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(0);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('not allowed!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not delete the channel info'));
	});

	it('should delete the expected channel info since he is authorized', async () => {
		const deleteChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'deleteChannelInfo').mockImplementation(async () => null);
		const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => channel);

		const req: any = {
			user: { id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu' }, // same id as authorId of channel
			params: { channelAddress: 'test-address' },
			body: null
		};

		await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

		expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(sendStatusMock).toHaveBeenCalledWith(200);
	});

	it('should call next(err) if an error occurs', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const getChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'getChannelInfo').mockImplementation(async () => channel);
		const deleteChannelInfoSpy = jest.spyOn(ChannelInfoDb, 'deleteChannelInfo').mockImplementation(() => {
			throw new Error('Test error');
		});
		const req: any = {
			user: { id: 'did:iota:6hyaHgrvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu' }, // same id as authorId of channel
			params: { channelAddress: 'test-address' },
			body: null
		};
		await channelInfoRoutes.deleteChannelInfo(req, res, nextMock);

		expect(getChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(deleteChannelInfoSpy).toHaveBeenCalledTimes(1);
		expect(sendMock).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(new Error('Test error'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not delete the channel info'));
	});
	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});
});
