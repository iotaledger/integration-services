import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '..';
import { Subscription, AccessRights, SubscriptionType, ChannelType } from '@iota/is-shared-modules';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';
import * as subscriptionDb from '../../../database/subscription';
import * as channelDataDb from '../../../database/channel-data';
import { AuthorMock } from '../../../test/mocks/streams';
import base58 from 'bs58';

describe('test authorize subscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		id: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		streamsService = new StreamsService(config, LoggerMock);
		jest.spyOn(streamsService, 'getMessages').mockImplementation(async () => []);
		channelInfoService = new ChannelInfoService();
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);
		jest.spyOn(channelDataDb, 'addChannelData').mockImplementation(async () => null);
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
			body: undefined, // no body
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalled();
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should bad request if no id is provided', async () => {
		const req: any = {
			params: {},
			user: { id: undefined }, //no id,
			body: { accessRights: AccessRights.Read },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no id provided' });
	});

	it('should return error if no subscription using the link is found to authorize', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		jest.spyOn(subscriptionService, 'getSubscriptionByLink').mockReturnValue(null); // no subscription found to authorize
		const req: any = {
			params: {}, // no channelAddress
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read }, // no link provided so getSubscriptionByLink should return null
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return error if no subscription using the id is found to authorize', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		jest.spyOn(subscriptionService, 'getSubscription').mockReturnValue(null); // no subscription found to authorize
		const req: any = {
			params: {}, // no channelAddress
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return bad request since subscription is already authorized', async () => {
		const sub = { ...subscriptionMock, isAuthorized: true };
		jest.spyOn(subscriptionService, 'getSubscription').mockImplementation(async () => sub);
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'subscription already authorized' });
	});

	it('should return bad request since caller is not the valid author', async () => {
		const authorId = 'did:iota:1234';
		const notanauthor: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Subscriber, // caller is not the valid author
			id: authorId,
			isAuthorized: true
		};
		const isAuthor = false;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);

		const sub = { ...subscriptionMock, isAuthorized: false };
		// TODO
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => sub)
			.mockImplementationOnce(async () => notanauthor);
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: 'did:iota:different-as-author' },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'not the valid author of the channel' });
	});

	test.each([
		{ type: ChannelType.private, asymSharedKey: "somesharedKey", error: 'Please do not define an asym-shared-key.' },
		{ type: ChannelType.privatePlus, asymSharedKey: undefined, error: 'An asym-shared-key is required for privatePlus channels.' }])
		('should return error if channel type is privatePlus and no asymSharedKey is provided or if private and asymSharedKey is provided', async ({ type, asymSharedKey, error }) => {
			jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => type)
			const authorId = 'did:iota:1234';
			const author: Subscription = {
				accessRights: AccessRights.ReadAndWrite,
				channelAddress: 'testaddress',
				type: SubscriptionType.Subscriber, // caller is not the valid author
				id: authorId,
				isAuthorized: false
			};
			const isAuthor = true;
			jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);

			const sub = { ...subscriptionMock, isAuthorized: false };
			jest
				.spyOn(subscriptionService, 'getSubscription')
				.mockImplementationOnce(async () => sub)
				.mockImplementationOnce(async () => author);
			const req: any = {
				params: { channelAddress: 'testaddress' },
				user: { id: 'did:iota:1234' },
				body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
				query: { 'asym-shared-key': asymSharedKey }
			};

			await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith({ error: error });
		});

	it('should throw an error since the author of the channel is not found', async () => {
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private)
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			id: authorId,
			isAuthorized: true
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementationOnce(async () => 'teststateofauthor');
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockReturnValue(null); // no author
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: authorId },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true, StreamsConfigMock.password);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no author found with channelAddress: testaddress and id: did:iota:1234'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should throw an error since the authorization has no keyloadLink', async () => {
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private)
		const pskId = 'testpskId';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			id: authorId,
			isAuthorized: true,
			pskId
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementationOnce(async () => 'teststateofauthor');
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe').mockImplementation(async () => null);
		const authorMock = AuthorMock;
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock); // author found
		const authorizeSubscriptionSpy = jest
			.spyOn(streamsService, 'sendKeyload')
			.mockImplementation(async () => ({ keyloadLink: '', sequenceLink: '' }));
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: authorId },
			body: { accessRights: AccessRights.ReadAndWrite, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true, StreamsConfigMock.password);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no keyload link found when authorizing the subscription'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return keyloadLink for authorized subscription without a presharedKey', async () => {
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private)
		const pskId: string = undefined;
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			id: authorId,
			isAuthorized: true,
			pskId // presharedKey is undefined
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementationOnce(async () => 'teststateofauthor');
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);
		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const authorMock = AuthorMock;
		const removeChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'removeChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		const addChannelSubscriberIdSpy = jest.spyOn(channelInfoService, 'addChannelSubscriberId').mockImplementation(async () => null);
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe').mockImplementation(async () => null);
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock); // author found
		const updateSubscriptionStateSpy = jest.spyOn(subscriptionService, 'updateSubscriptionState').mockImplementation(async () => null);
		const authorizeSubscriptionSpy = jest.spyOn(streamsService, 'sendKeyload').mockImplementation(async () => ({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		})); // keyloadLink got created
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('new-state');
		const setSubscriptionAuthorizedSpy = jest.spyOn(subscriptionService, 'setSubscriptionAuthorized').mockImplementation(async () => null);
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: authorId },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true, StreamsConfigMock.password);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(removeChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(addChannelSubscriberIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});

	it('should return keyloadLink for authorized subscription', async () => {
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.private)
		const pskId = 'testpskid';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			id: authorId,
			isAuthorized: true,
			pskId
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementationOnce(async () => 'teststateofauthor');
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);

		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const authorMock = AuthorMock;
		const removeChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'removeChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		const addChannelSubscriberIdSpy = jest.spyOn(channelInfoService, 'addChannelSubscriberId').mockImplementation(async () => null);
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe').mockImplementation(async () => null);
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock); // author found
		const updateSubscriptionStateSpy = jest.spyOn(subscriptionService, 'updateSubscriptionState').mockImplementation(async () => null);
		const authorizeSubscriptionSpy = jest.spyOn(streamsService, 'sendKeyload').mockImplementation(async () => ({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		})); // keyloadLink got created
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('new-state');
		const setSubscriptionAuthorizedSpy = jest.spyOn(subscriptionService, 'setSubscriptionAuthorized').mockImplementation(async () => null);
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: authorId },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: {}
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true, StreamsConfigMock.password);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(removeChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(addChannelSubscriberIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});

	it('should return keyloadLink for privatePlus Channels', async () => {
		jest.spyOn(channelInfoService, 'getChannelType').mockImplementation(async () => ChannelType.privatePlus)
		const pskId = 'testpskid';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			id: authorId,
			isAuthorized: true,
			pskId
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest.spyOn(subscriptionService, 'getSubscriptionState').mockImplementationOnce(async () => 'teststateofauthor');
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);

		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const authorMock = AuthorMock;
		const removeChannelRequestedSubscriptionIdSpy = jest
			.spyOn(channelInfoService, 'removeChannelRequestedSubscriptionId')
			.mockImplementation(async () => null);
		const addChannelSubscriberIdSpy = jest.spyOn(channelInfoService, 'addChannelSubscriberId').mockImplementation(async () => null);
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe').mockImplementation(async () => null);
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock); // author found
		const updateSubscriptionStateSpy = jest.spyOn(subscriptionService, 'updateSubscriptionState').mockImplementation(async () => null);
		const authorizeSubscriptionSpy = jest.spyOn(streamsService, 'sendKeyload').mockImplementation(async () => ({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		})); // keyloadLink got created
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('new-state');
		const setSubscriptionAuthorizedSpy = jest.spyOn(subscriptionService, 'setSubscriptionAuthorized').mockImplementation(async () => null);

		const asymSharedKey = base58.encode(Buffer.from('anyAsymSharedKey'));
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { id: authorId },
			body: { accessRights: AccessRights.Read, id: 'did:iota:2345' },
			query: { 'asym-shared-key': asymSharedKey }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true, asymSharedKey);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, asymSharedKey);
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(removeChannelRequestedSubscriptionIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(addChannelSubscriberIdSpy).toHaveBeenCalledWith('testaddress', 'did:iota:1234');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});
});
