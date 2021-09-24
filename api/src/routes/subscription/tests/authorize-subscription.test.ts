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
		spyOn(streamsService, 'getMessages').and.returnValue([]);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, LoggerMock);
		spyOn(channelDataDb, 'addChannelData');
		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	it('should call nextMock if no body is provided', async () => {
		const loggerSpy = spyOn(LoggerMock, 'error');
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
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscriptionByLink').and.returnValue(null); // no subscription found to authorize
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
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscription').and.returnValue(null); // no subscription found to authorize
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
		spyOn(subscriptionService, 'getSubscription').and.returnValue(sub);
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
		spyOn(subscriptionService, 'isAuthor').and.returnValue(isAuthor);

		const sub = { ...subscriptionMock, isAuthorized: false };
		spyOn(subscriptionService, 'getSubscription').and.returnValues(sub, notanauthor);
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
		spyOn(subscriptionService, 'isAuthor').and.returnValue(isAuthor);
		spyOn(subscriptionService, 'getSubscription').and.returnValues(subscriptionMock, author);
		const loggerSpy = spyOn(LoggerMock, 'error');
		const importAuthorSpy = spyOn(streamsService, 'importSubscription').and.returnValue(null); // no author
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
		const presharedKey = 'd57921c36648c411db5048b652ec11b8';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor',
			presharedKey
		};
		const isAuthor = true;
		spyOn(subscriptionService, 'isAuthor').and.returnValue(isAuthor);
		spyOn(subscriptionService, 'getSubscription').and.returnValues(subscriptionMock, author);
		const loggerSpy = spyOn(LoggerMock, 'error');
		spyOn(subscriptionDb, 'getSubscriptions').and.returnValue([]);
		const receiveSubscribeSpy = spyOn(streamsService, 'receiveSubscribe');
		const authorMock = AuthorMock;
		const importAuthorSpy = spyOn(streamsService, 'importSubscription').and.returnValue(authorMock); // author found
		const authorizeSubscriptionSpy = spyOn(streamsService, 'sendKeyload').and.returnValue({ keyloadLink: '' });
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.ReadAndWrite, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, presharedKey);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no keyload link found when authorizing the subscription'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not authorize the subscription'));
	});

	it('should return keyloadLink for authorized subscription without a presharedKey', async () => {
		const presharedKey: string = undefined;
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor',
			presharedKey // presharedKey is undefined
		};
		const isAuthor = true;
		spyOn(subscriptionService, 'isAuthor').and.returnValue(isAuthor);
		spyOn(subscriptionService, 'getSubscription').and.returnValues(subscriptionMock, author);
		spyOn(subscriptionDb, 'getSubscriptions').and.returnValue([]);
		const authorMock = AuthorMock;
		const receiveSubscribeSpy = spyOn(streamsService, 'receiveSubscribe');
		const importAuthorSpy = spyOn(streamsService, 'importSubscription').and.returnValue(authorMock); // author found
		const updateSubscriptionStateSpy = spyOn(subscriptionService, 'updateSubscriptionState');
		const authorizeSubscriptionSpy = spyOn(streamsService, 'sendKeyload').and.returnValue({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		}); // keyloadLink got created
		const exportSubscriptionSpy = spyOn(streamsService, 'exportSubscription').and.returnValue('new-state');
		const setSubscriptionAuthorizedSpy = spyOn(subscriptionService, 'setSubscriptionAuthorized');
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, presharedKey);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});

	it('should return keyloadLink for authorized subscription', async () => {
		const presharedKey = 'd57921c36648c411db5048b652ec11b8';
		const authorId = 'did:iota:1234';
		const author: Subscription = {
			accessRights: AccessRights.ReadAndWrite,
			channelAddress: 'testaddress',
			type: SubscriptionType.Author,
			identityId: authorId,
			isAuthorized: true,
			state: 'teststateofauthor',
			presharedKey
		};
		const isAuthor = true;
		spyOn(subscriptionService, 'isAuthor').and.returnValue(isAuthor);
		spyOn(subscriptionService, 'getSubscription').and.returnValues(subscriptionMock, author);
		spyOn(subscriptionDb, 'getSubscriptions').and.returnValue([]);
		const authorMock = AuthorMock;
		const receiveSubscribeSpy = spyOn(streamsService, 'receiveSubscribe');
		const importAuthorSpy = spyOn(streamsService, 'importSubscription').and.returnValue(authorMock); // author found
		const updateSubscriptionStateSpy = spyOn(subscriptionService, 'updateSubscriptionState');
		const authorizeSubscriptionSpy = spyOn(streamsService, 'sendKeyload').and.returnValue({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: authorMock
		}); // keyloadLink got created
		const exportSubscriptionSpy = spyOn(streamsService, 'exportSubscription').and.returnValue('new-state');
		const setSubscriptionAuthorizedSpy = spyOn(subscriptionService, 'setSubscriptionAuthorized');
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: authorId },
			body: { accessRights: AccessRights.Read, identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.authorizeSubscription(req, res, nextMock);

		expect(importAuthorSpy).toHaveBeenCalledWith('teststateofauthor', true);
		expect(receiveSubscribeSpy).toHaveBeenCalledWith('testlink', authorMock);
		expect(authorizeSubscriptionSpy).toHaveBeenCalledWith('testaddress', ['testpublickey', 'test-author-public-key'], authorMock, presharedKey);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith('testaddress', authorId, 'testkeyloadlink', 'testsequencelink');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(authorMock, 'veryvery-very-very-server-secret');
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith('testaddress', authorId, 'new-state');
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.send).toHaveBeenCalledWith({ keyloadLink: 'testkeyloadlink', sequenceLink: 'testsequencelink' });
	});
});
