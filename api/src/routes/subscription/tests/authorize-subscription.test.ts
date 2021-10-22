import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '..';
import { Subscription } from '../../../models/types/subscription';
import { AccessRights, SubscriptionType } from '../../../models/schemas/subscription';
import { ChannelInfoService } from '../../../services/channel-info-service';
import { StreamsService } from '../../../services/streams-service';
import { SubscriptionService } from '../../../services/subscription-service';
import { UserService } from '../../../services/user-service';
import { StreamsConfigMock } from '../../../test/mocks/config';
import { LoggerMock } from '../../../test/mocks/logger';
import * as subscriptionDb from '../../../database/subscription';
import * as channelDataDb from '../../../database/channel-data';
import { AuthorMock } from '../../../test/mocks/streams';

describe('test authorize subscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;
	const subscriptionMock: Subscription = {
		accessRights: AccessRights.Read,
		channelAddress: 'testaddress',
		identityId: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		state: 'teststate',
		subscriptionLink: 'testlink',
		type: SubscriptionType.Subscriber
	};

	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService({} as any, '', LoggerMock);
		streamsService = new StreamsService(config, LoggerMock);
		jest.spyOn(streamsService, 'getMessages').mockImplementation(async () => []);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);
		jest.spyOn(channelDataDb, 'addChannelData');
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
			user: { identityId: undefined },
			body: undefined // no body
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error("Cannot read property 'subscriptionLink' of undefined"));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should bad request if no identityId is provided', async () => {
		const req: any = {
			params: {},
			user: { identityId: undefined }, //no identityId,
			body: { accessRights: AccessRights.Read }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no identityId provided' });
	});

	it('should return error if no subscription using the link is found to authorize', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		jest.spyOn(subscriptionService, 'getSubscriptionByLink').mockReturnValue(null); // no subscription found to authorize
		const req: any = {
			params: {}, // no channelAddress
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read } // no link provided so getSubscriptionByLink should return null
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
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
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
			user: { identityId: 'did:iota:1234' },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
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
			identityId: authorId,
			isAuthorized: true,
			state: ''
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
			user: { identityId: 'did:iota:different-as-author' },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'not the valid author of the channel' });
	});

	it('should throw an error since the author of the channel is not found', async () => {
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor'
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockReturnValue(null); // no author
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);
		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no author found with channelAddress: testaddress and identityId: did:iota:1234'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should throw an error since the authorization has no keyloadLink', async () => {
		const pskId = 'testpskId';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor',
			pskId
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe');
		const authorMock = AuthorMock;
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock as any); // author found
		const authorizeSubscriptionSpy = jest.spyOn(streamsService, 'sendKeyload').mockImplementation(async () => ({ keyloadLink: '' } as any));
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.ReadAndWrite, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no keyload link found when authorizing the subscription'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return keyloadLink for authorized subscription without a presharedKey', async () => {
		const pskId: string = undefined;
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor',
			pskId // presharedKey is undefined
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);
		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const authorMock = AuthorMock;
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe');
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock as any); // author found
		const updateSubscriptionStateSpy = jest.spyOn(subscriptionService, 'updateSubscriptionState');
		const authorizeSubscriptionSpy = jest.spyOn(streamsService, 'sendKeyload').mockImplementation(async () => ({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		})); // keyloadLink got created
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('new-state');
		const setSubscriptionAuthorizedSpy = jest.spyOn(subscriptionService, 'setSubscriptionAuthorized');
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});

	it('should return keyloadLink for authorized subscription', async () => {
		const pskId = 'testpskid';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor',
			pskId
		};
		const isAuthor = true;
		jest.spyOn(subscriptionService, 'isAuthor').mockImplementation(async () => isAuthor);
		jest
			.spyOn(subscriptionService, 'getSubscription')
			.mockImplementationOnce(async () => subscriptionMock)
			.mockImplementationOnce(async () => author);

		jest.spyOn(subscriptionDb, 'getSubscriptions').mockImplementation(async () => []);
		const authorMock = AuthorMock;
		const receiveSubscribeSpy = jest.spyOn(streamsService, 'receiveSubscribe');
		const importAuthorSpy = jest.spyOn(streamsService, 'importSubscription').mockImplementation(async () => authorMock as any); // author found
		const updateSubscriptionStateSpy = jest.spyOn(subscriptionService, 'updateSubscriptionState');
		const authorizeSubscriptionSpy = jest.spyOn(streamsService, 'sendKeyload').mockImplementation(async () => ({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		})); // keyloadLink got created
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('new-state');
		const setSubscriptionAuthorizedSpy = jest.spyOn(subscriptionService, 'setSubscriptionAuthorized');
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, pskId);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});
});
