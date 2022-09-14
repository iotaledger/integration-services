import { StatusCodes } from 'http-status-codes';
import { ChannelRoutes } from '..';
import { ChannelInfo, Subscription, AccessRights, SubscriptionType, ChannelType, ChannelData } from '@iota/is-shared-modules';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { ChannelService } from '../../../services/channel-service';
import { StreamsMessage, StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { StreamsConfigMock, ConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';
import { AuthorMock } from '../../../test/mocks/streams';
import axios from 'axios';

describe('test channel routes', () => {
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

	describe('test create channel route', () => {
		it('should call nextMock if no body is provided', async () => {
			const loggerSpy = jest.spyOn(LoggerMock, 'error');
			const req: any = {
				params: {},
				user: { id: undefined },
				body: undefined // no body
			};

			await channelRoutes.createChannel(req, res, nextMock);
			expect(loggerSpy).toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(new Error('could not create the channel'));
		});

		it('should bad request if no id is provided', async () => {
			const req: any = {
				params: {},
				user: { id: undefined }, //no id,
				body: {}
			};

			await channelRoutes.createChannel(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no id provided' });
		});
		it('should return conflict since name has to be unique', async () => {
			const req: any = {
				params: {},
				user: { id: 'did:iota:1234' },
				body: { topics: [], seed: 'verysecretseed', name: 'test-channel' }
			};

			const channelExistsSpy = jest.spyOn(channelService, 'channelExists').mockImplementation(async () => true);

			await channelRoutes.createChannel(req, res, nextMock);

			expect(channelExistsSpy).toHaveBeenCalledWith(req.body.name);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
			expect(res.send).toHaveBeenCalledWith({ error: 'channel already exists' });
		});
		it('should create and return a channel for the user', async () => {
			const req: any = {
				params: {},
				user: { id: 'did:iota:1234' },
				body: { topics: [], seed: 'verysecretseed', name: 'test-channel', hidden: true, visibilityList: [{ id: 'did:iota:12345' }] }
			};

			const expectedSubscription: Subscription = {
				accessRights: AccessRights.ReadAndWrite,
				channelAddress: '1234234234',
				keyloadLink: 'author-keyload-link',
				isAuthorized: true,
				subscriptionLink: '1234234234',
				type: SubscriptionType.Author,
				id: 'did:iota:1234',
				publicKey: 'testpublickey',
				pskId: '',
				sequenceLink: ''
			};
			const expectedChannelInfo: ChannelInfo = {
				authorId: 'did:iota:1234',
				name: 'test-channel',
				channelAddress: '1234234234',
				topics: [],
				hidden: true,
				visibilityList: [{ id: 'did:iota:12345' }]
			};

			const exportSubscriptionSpy = jest
				.spyOn(streamsService, 'exportSubscription')
				.mockReturnValue('uint8array string of subscription state');
			const createSpy = jest.spyOn(streamsService, 'create').mockImplementation(async () => ({
				seed: 'verysecretseed',
				author: AuthorMock,
				channelAddress: '1234234234',
				keyloadLink: 'author-keyload-link',
				publicKey: 'testpublickey',
				presharedKey,
				pskId: '',
				sequenceLink: ''
			}));
			const addSubscriptionSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
			const addChannelInfoSpy = jest.spyOn(channelInfoService, 'addChannelInfo').mockImplementation(async () => null);
			const channelExistsSpy = jest.spyOn(channelService, 'channelExists').mockImplementation(async () => false);

			await channelRoutes.createChannel(req, res, nextMock);

			const presharedKey: string = undefined;
			expect(createSpy).toHaveBeenCalledWith(false, 'verysecretseed', presharedKey);
			expect(exportSubscriptionSpy).toHaveBeenCalledWith(AuthorMock, StreamsConfigMock.password);
			expect(addSubscriptionSpy).toHaveBeenCalledWith(expectedSubscription);
			expect(addChannelInfoSpy).toHaveBeenCalledWith(expectedChannelInfo);
			expect(channelExistsSpy).toHaveBeenCalledWith(expectedChannelInfo.name);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith({ channelAddress: '1234234234', seed: 'verysecretseed', presharedKey });
		});
		it('should create and return a channel for the user using a preshared key', async () => {
			const presharedKey = 'd57921c36648c411db5048b652ec11b8';
			const pskId = 'testpskid';
			const req: any = {
				params: {},
				user: { id: 'did:iota:1234' },
				body: { name: 'test-name', topics: [], presharedKey, hasPresharedKey: true }
			};

			const expectedSubscription: Subscription = {
				accessRights: AccessRights.ReadAndWrite,
				channelAddress: '1234234234',
				keyloadLink: 'author-keyload-link',
				isAuthorized: true,
				subscriptionLink: '1234234234',
				type: SubscriptionType.Author,
				id: 'did:iota:1234',
				pskId,
				publicKey: '',
				sequenceLink: ''
			};
			const expectedChannelInfo: ChannelInfo = {
				authorId: 'did:iota:1234',
				name: 'test-name',
				channelAddress: '1234234234',
				topics: []
			};

			const exportSubscriptionSpy = jest
				.spyOn(streamsService, 'exportSubscription')
				.mockReturnValue('uint8array string of subscription state');
			const createSpy = jest.spyOn(streamsService, 'create').mockImplementation(async () => ({
				seed: 'verysecretseed',
				author: {} as any,
				channelAddress: '1234234234',
				pskId,
				presharedKey,
				keyloadLink: 'author-keyload-link',
				publicKey: '',
				sequenceLink: ''
			}));
			const addSubscriptionSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
			const addChannelInfoSpy = jest.spyOn(channelInfoService, 'addChannelInfo').mockImplementation(async () => null);
			const channelExistsSpy = jest.spyOn(channelService, 'channelExists').mockImplementation(async () => false);

			await channelRoutes.createChannel(req, res, nextMock);

			expect(createSpy).toHaveBeenCalledWith(false, undefined, presharedKey);
			expect(exportSubscriptionSpy).toHaveBeenCalledWith({}, StreamsConfigMock.password);
			expect(addSubscriptionSpy).toHaveBeenCalledWith(expectedSubscription);
			expect(addChannelInfoSpy).toHaveBeenCalledWith(expectedChannelInfo);
			expect(channelExistsSpy).toHaveBeenCalledWith(expectedChannelInfo.name);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith({ channelAddress: '1234234234', seed: 'verysecretseed', presharedKey });
		});

		it('should create and return a public channel for the user', async () => {
			const type = ChannelType.public;
			const req: any = {
				params: {},
				user: { id: 'did:iota:1234' },
				body: { name: 'test-name', topics: [], type }
			};

			const expectedSubscription: Subscription = {
				accessRights: AccessRights.ReadAndWrite,
				channelAddress: '1234234234',
				keyloadLink: 'author-keyload-link',
				isAuthorized: true,
				subscriptionLink: '1234234234',
				type: SubscriptionType.Author,
				id: 'did:iota:1234',
				publicKey: '',
				sequenceLink: ''
			};
			const expectedChannelInfo: ChannelInfo = {
				authorId: 'did:iota:1234',
				name: 'test-name',
				channelAddress: '1234234234',
				type,
				topics: []
			};

			const exportSubscriptionSpy = jest
				.spyOn(streamsService, 'exportSubscription')
				.mockReturnValue('uint8array string of subscription state');
			const createSpy = jest.spyOn(streamsService, 'create').mockImplementation(async () => ({
				seed: 'verysecretseed',
				author: {} as any,
				channelAddress: '1234234234',
				type,
				keyloadLink: 'author-keyload-link',
				publicKey: '',
				sequenceLink: ''
			}));
			const addSubscriptionSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
			const addChannelInfoSpy = jest.spyOn(channelInfoService, 'addChannelInfo').mockImplementation(async () => null);
			const channelExistsSpy = jest.spyOn(channelService, 'channelExists').mockImplementation(async () => false);

			await channelRoutes.createChannel(req, res, nextMock);

			expect(createSpy).toHaveBeenCalledWith(true, undefined, undefined);
			expect(exportSubscriptionSpy).toHaveBeenCalledWith({}, StreamsConfigMock.password);
			expect(addSubscriptionSpy).toHaveBeenCalledWith(expectedSubscription);
			expect(addChannelInfoSpy).toHaveBeenCalledWith(expectedChannelInfo);
			expect(channelExistsSpy).toHaveBeenCalledWith(expectedChannelInfo.name);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith({
				channelAddress: '1234234234',
				seed: 'verysecretseed'
			});
		});

		it('should return error for private plus channel since no encryption key found in identity doc', async () => {
			const type = ChannelType.privatePlus;
			const req: any = {
				params: {},
				user: { id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi' },
				body: { name: 'test-name', topics: [], type }
			};

			const axiosGetSpy = jest.spyOn(axios, 'get').mockImplementation(
				async () =>
					({
						data: {
							document: {
								doc: {
									id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
									capabilityInvocation: [
										{
											id: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi#sign-0',
											controller: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi',
											type: 'Ed25519VerificationKey2018',
											publicKeyMultibase: 'zGPpRru9YxgY2amWqzAkWbLwuL25x47o73oBhp4f5avij'
										}
									]
								},
								meta: {
									created: '2022-07-21T15:26:04Z',
									updated: '2022-07-21T15:26:04Z'
								},
								proof: {
									type: 'JcsEd25519Signature2020',
									verificationMethod: 'did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi#sign-0',
									signatureValue: 'UnFqyMkHVLP3ToyE8bteiEukjmHbQbtWzstYByNgJrCZxTosHdXsx4k4VzRNE6KZffPJFpkNv6dyXFfmv7tc2n5'
								}
							},
							messageId: 'c9e1555190eeaf2eceb6d246618388b799eebb9c2b8225eaef3468cc52d28e46'
						}
					} as any)
			);

			await channelRoutes.createChannel(req, res, nextMock);

			const expectedUrl =
				'http://localhost:3001/api/v0.2/verification/latest-document/did:iota:EMjd32WoJqWMHnktc3TrjdMH6brTovTe5bGpPrVuDdKi';
			expect(axiosGetSpy).toHaveBeenCalledWith(expectedUrl);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({
				error: 'could not find an encryption key in the identity document.'
			});
		});

		it('should create and return a privatePlus channel for the user', async () => {
			const type = ChannelType.privatePlus;
			const req: any = {
				params: {},
				user: { id: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh' },
				body: { name: 'test-name', topics: [], type }
			};

			const expectedSubscription: Subscription = {
				accessRights: AccessRights.ReadAndWrite,
				channelAddress: '1234234234',
				keyloadLink: 'author-keyload-link',
				isAuthorized: true,
				subscriptionLink: '1234234234',
				type: SubscriptionType.Author,
				id: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh',
				publicKey: '',
				sequenceLink: ''
			};
			const expectedChannelInfo: ChannelInfo = {
				authorId: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh',
				name: 'test-name',
				channelAddress: '1234234234',
				type,
				topics: []
			};

			const exportSubscriptionSpy = jest
				.spyOn(streamsService, 'exportSubscription')
				.mockReturnValue('uint8array string of subscription state');
			const createSpy = jest.spyOn(streamsService, 'create').mockImplementation(async () => ({
				seed: 'verysecretseed',
				author: {} as any,
				channelAddress: '1234234234',
				type,
				keyloadLink: 'author-keyload-link',
				publicKey: '',
				sequenceLink: ''
			}));
			const addSubscriptionSpy = jest.spyOn(subscriptionService, 'addSubscription').mockImplementation(async () => null);
			const addChannelInfoSpy = jest.spyOn(channelInfoService, 'addChannelInfo').mockImplementation(async () => null);
			const channelExistsSpy = jest.spyOn(channelService, 'channelExists').mockImplementation(async () => false);

			const axiosGetSpy = jest.spyOn(axios, 'get').mockImplementation(
				async () =>
					({
						data: {
							document: {
								doc: {
									id: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh',
									keyAgreement: [
										{
											id: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh#kex-0',
											controller: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh',
											type: 'X25519KeyAgreementKey2019',
											publicKeyMultibase: 'z8D8NDTpQGYBJ2VqzCFVYM8QFoSQfEA9AzfF9PH5r3mmf'
										}
									],
									capabilityInvocation: [
										{
											id: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh#sign-0',
											controller: 'did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh',
											type: 'Ed25519VerificationKey2018',
											publicKeyMultibase: 'zG6VqjAK36SNiEthugd8hvBhqt9bXnz26DxdFZTgxokHR'
										}
									]
								},
								meta: {
									created: '2022-09-07T14:00:14Z',
									updated: '2022-09-07T14:00:14Z'
								},
								proof: {
									type: 'JcsEd25519Signature2020',
									verificationMethod: '#sign-0',
									signatureValue: '4ZA9GZEDr2pdZcucPmXmFQAcbbRwVxhNjY3qSDLPHYxh3dmRHwHSDJ7GepikMYkNk5zk4BAP8Urpk95B8F1k8w3s'
								}
							},
							messageId: '99f85f3a57c55ad355133ffd1635d7cfda288f26702e89ce2e2f7c252a265208'
						}
					} as any)
			);

			await channelRoutes.createChannel(req, res, nextMock);

			const expectedUrl =
				'http://localhost:3001/api/v0.2/verification/latest-document/did:iota:ApSzWyBQSzaTgbqesffrGJmfxTWD5wAFeKVpyWQcvAXh';
			expect(axiosGetSpy).toHaveBeenCalledWith(expectedUrl);
			expect(exportSubscriptionSpy).toHaveBeenCalled();
			expect(addSubscriptionSpy).toHaveBeenCalledWith(expectedSubscription);
			expect(addChannelInfoSpy).toHaveBeenCalled();
			expect(channelExistsSpy).toHaveBeenCalledWith(expectedChannelInfo.name);
			expect(createSpy).toHaveBeenCalledWith(false, undefined, undefined);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith({
				channelAddress: '1234234234',
				seed: 'verysecretseed'
			});
		});
	});

	describe('test getLogs channel route', () => {
		it('should return bad request if no id is provided', async () => {
			const req: any = {
				params: { channelAddress: '12345' },
				user: { id: undefined }, //no id,
				body: {}
			};

			await channelRoutes.getLogs(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
		});

		it('should return bad request if no channelAddress is provided', async () => {
			const req: any = {
				params: {}, // no channelAddress
				user: { id: 'did:iota:1234' },
				body: {}
			};

			await channelRoutes.getLogs(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
		});

		it('should return bad request if startDate is after endDate', async () => {
			const req: any = {
				params: { channelAddress: '12345' },
				user: { id: 'did:iota:1234' },
				body: {},
				query: { 'start-date': '2021-09-29T10:00:00+02:00', 'end-date': '2021-09-28T10:00:00+02:00' }
			};

			await channelRoutes.getLogs(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'start date is after end date' });
		});

		it('should return bad request if channel is private but has a asym-shared-key declared', async () => {
			const req: any = {
				params: { channelAddress: 'mychanneladdress-12345' },
				user: { id: 'did:iota:1234' },
				body: {},
				query: { 'asym-shared-key': 'myasymSharedKey' }
			};

			const getChannelTypeSpy = jest.spyOn(channelInfoService, 'getChannelType').mockImplementationOnce(async () => ChannelType.private);

			await channelRoutes.getLogs(req, res, nextMock);

			expect(getChannelTypeSpy).toHaveBeenCalledWith('mychanneladdress-12345');
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'Please do not define an asym-shared-key.' });
		});

		it('should return bad request if channel is privatePlus but has no asym-shared-key declared', async () => {
			const req: any = {
				params: { channelAddress: 'mychanneladdress-12345' },
				user: { id: 'did:iota:1234' },
				body: {},
				query: {}
			};

			const getChannelTypeSpy = jest
				.spyOn(channelInfoService, 'getChannelType')
				.mockImplementationOnce(async () => ChannelType.privatePlus);

			await channelRoutes.getLogs(req, res, nextMock);

			expect(getChannelTypeSpy).toHaveBeenCalledWith('mychanneladdress-12345');
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'An asym-shared-key is required for privatePlus channels.' });
		});

		it('should return ok request for privatePlus channel', async () => {
			const req: any = {
				params: { channelAddress: 'mychanneladdress-12345' },
				user: { id: 'did:iota:1234' },
				query: { 'asym-shared-key': 'myasymSharedKey' }
			};

			const getChannelTypeSpy = jest
				.spyOn(channelInfoService, 'getChannelType')
				.mockImplementationOnce(async () => ChannelType.privatePlus);
			const data: ChannelData = {
				link: 'somelink',
				log: {
					payload: 'mypayload'
				}
			};
			jest.spyOn(channelService, 'getLogs').mockImplementationOnce(async () => [data]);

			await channelRoutes.getLogs(req, res, nextMock);

			expect(getChannelTypeSpy).toHaveBeenCalledWith('mychanneladdress-12345');
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith([data]);
		});
	});

	describe('test addLog channel route', () => {
		it('should return bad request if no id is provided', async () => {
			const req: any = {
				params: { channelAddress: '12345' },
				user: { id: undefined }, //no id,
				body: { payload: '' },
				query: {}
			};

			await channelRoutes.addLog(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
		});

		it('should return bad request if no channelAddress is provided', async () => {
			const req: any = {
				params: {}, // no channelAddress
				user: { id: 'did:iota:1234' },
				body: { payload: '' },
				query: {}
			};

			await channelRoutes.addLog(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or id provided' });
		});

		it('should return bad request if channel is private but has a asym-shared-key declared', async () => {
			const req: any = {
				params: { channelAddress: 'mychanneladdress-12345' },
				user: { id: 'did:iota:1234' },
				body: { payload: 'mypayload' },
				query: { 'asym-shared-key': 'myasymSharedKey' }
			};

			const getChannelTypeSpy = jest.spyOn(channelInfoService, 'getChannelType').mockImplementationOnce(async () => ChannelType.private);

			await channelRoutes.addLog(req, res, nextMock);

			expect(getChannelTypeSpy).toHaveBeenCalledWith('mychanneladdress-12345');
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'Please do not define an asymSharedKey.' });
		});

		it('should return bad request if channel is privatePlus but has no asym-shared-key declared', async () => {
			const req: any = {
				params: { channelAddress: 'mychanneladdress-12345' },
				user: { id: 'did:iota:1234' },
				body: { payload: 'mypayload' },
				query: {}
			};

			const getChannelTypeSpy = jest
				.spyOn(channelInfoService, 'getChannelType')
				.mockImplementationOnce(async () => ChannelType.privatePlus);

			await channelRoutes.addLog(req, res, nextMock);

			expect(getChannelTypeSpy).toHaveBeenCalledWith('mychanneladdress-12345');
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'An asym-shared-key is required for privatePlus channels.' });
		});

		it('should return ok request for privatePlus channel', async () => {
			const req: any = {
				params: { channelAddress: 'mychanneladdress-12345' },
				user: { id: 'did:iota:1234' },
				body: { payload: 'mypayload' },
				query: { 'asym-shared-key': 'myasymSharedKey' }
			};

			const getChannelTypeSpy = jest
				.spyOn(channelInfoService, 'getChannelType')
				.mockImplementationOnce(async () => ChannelType.privatePlus);
			const data: ChannelData = {
				link: 'somelink',
				log: {
					payload: 'mypayload'
				}
			};
			jest.spyOn(channelService, 'addLog').mockImplementationOnce(async () => data);

			await channelRoutes.addLog(req, res, nextMock);

			expect(getChannelTypeSpy).toHaveBeenCalledWith('mychanneladdress-12345');
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(data);
		});
	});

	describe('test getHistory channel route', () => {
		it('should return bad request if no channelAddress is provided', async () => {
			const req: any = {
				params: {},
				body: {}
			};

			await channelRoutes.getHistory(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress provided' });
		});

		it('should bad request if no presharedKey is provided', async () => {
			const req: any = {
				params: { channelAddress: '12345' },
				query: {}, // no preshared-key provided
				body: {}
			};

			await channelRoutes.getHistory(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: 'no preshared-key provided' });
		});

		it('should return the data if both is is provided', async () => {
			const req: any = {
				params: { channelAddress: '12345' },
				query: { 'preshared-key': 'eaifooaeenagr' },
				body: {}
			};
			const messages: StreamsMessage[] = [
				{ link: '12313:00', maskedPayload: undefined, messageId: '123', publicPayload: { data: { a: 124 } } }
			];
			const requestSubscriptionSpy = jest
				.spyOn(streamsService, 'requestSubscription')
				.mockImplementation(async () => ({ subscriber: null, pskId: '', seed: '' }));
			const getMessagesSpy = jest.spyOn(streamsService, 'getMessages').mockImplementation(async () => messages);

			await channelRoutes.getHistory(req, res, nextMock);
			expect(requestSubscriptionSpy).toHaveBeenCalledWith('12345', false, undefined, 'eaifooaeenagr');
			expect(getMessagesSpy).toHaveBeenCalledWith(null);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith([
				{
					log: { created: undefined, metadata: undefined, payload: undefined, publicPayload: { a: 124 }, type: undefined },
					link: '12313:00',
					messageId: '123'
				}
			]);
		});
	});
});
