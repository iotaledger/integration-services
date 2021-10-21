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
import * as SubscriptionDb from '../../../database/subscription';
import * as ChannelDataDb from '../../../database/channel-data';
import { AuthorMock } from '../../../test/mocks/streams';

describe('test revoke subscription route', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
	let channelInfoService: ChannelInfoService, userService: UserService, subscriptionService: SubscriptionService;

	const subscriptionMock: Subscription = {
		channelAddress: 'testaddress',
		identityId: 'did:iota:1234',
		isAuthorized: false,
		publicKey: 'testpublickey',
		state: 'teststate',
		subscriptionLink: 'testlink',
		accessRights: AccessRights.ReadAndWrite,
		keyloadLink: 'testkeyloadlink',
		sequenceLink: 'testsequencelink',
		type: SubscriptionType.Subscriber
	};

	const authorSubscriptionMock: Subscription = {
		channelAddress: 'testaddress',
		identityId: 'did:iota:2345',
		isAuthorized: true,
		publicKey: 'test-author-public-key',
		state: 'teststate2',
		subscriptionLink: 'testlink2',
		accessRights: AccessRights.ReadAndWrite,
		keyloadLink: 'testkeyloadlink2',
		sequenceLink: 'testsequencelink2',
		type: SubscriptionType.Author
	};
	beforeEach(() => {
		sendMock = jest.fn();
		sendStatusMock = jest.fn();
		nextMock = jest.fn();
		const config = StreamsConfigMock;
		userService = new UserService({} as any, '', LoggerMock);
		streamsService = new StreamsService(config, LoggerMock);
		spyOn(streamsService, 'getMessages').mockReturnValue([]);
		channelInfoService = new ChannelInfoService(userService);
		subscriptionService = new SubscriptionService(streamsService, channelInfoService, config);
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, channelInfoService, LoggerMock);
		spyOn(ChannelDataDb, 'addChannelData');
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

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error("Cannot read property 'subscriptionLink' of undefined"));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not revoke the subscription'));
	});

	it('should bad request if no identityId is provided', async () => {
		const req: any = {
			params: {},
			user: { identityId: undefined }, //no identityId,
			body: {}
		};

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'no channelAddress or identityId provided' });
	});

	it('should return error if no author is found', async () => {
		spyOn(subscriptionService, 'getSubscription').and.returnValues(null, null); // no author found to authorize
		spyOn(subscriptionService, 'getSubscriptionByLink').and.returnValues(null, null); // no subscription found to authorize
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota:2345' },
			body: {}
		};

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.send).toHaveBeenCalledWith({ error: 'subscription must be an author' });
	});

	it('should return error if no subscription using the link is found to authorize', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscription').and.returnValues(authorSubscriptionMock, null); // no subscription found to authorize
		const getSubscriptionByLinkSpy = jest.spyOn(subscriptionService, 'getSubscriptionByLink').and.returnValues(null, null); // no subscription found to authorize
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota:2345' },
			body: { subscriptionLink: 'wrongsubscriptionlink' }
		};

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);

		expect(getSubscriptionByLinkSpy).toHaveBeenCalledWith('wrongsubscriptionlink');
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no valid subscription found!'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not revoke the subscription'));
	});

	it('should return ok if revokedSubscription is mocked', async () => {
		spyOn(subscriptionService, 'getSubscription').and.returnValues(authorSubscriptionMock, subscriptionMock);
		const revokeSubscriptionSpy = jest.spyOn(subscriptionService, 'revokeSubscription');
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota:1234' },
			body: { identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);
		expect(revokeSubscriptionSpy).toHaveBeenCalledWith('testaddress', subscriptionMock, authorSubscriptionMock);
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
	});

	it('should return bad request since subscription is already authorized', async () => {
		const loggerSpy = jest.spyOn(LoggerMock, 'error');
		spyOn(subscriptionService, 'getSubscription').and.returnValues(authorSubscriptionMock, subscriptionMock);
		spyOn(streamsService, 'importSubscription').mockReturnValue(null); // no author
		const req: any = {
			params: { channelAddress: 'testaddress' },
			user: { identityId: 'did:iota:1234' },
			body: { identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);
		expect(loggerSpy).toHaveBeenCalledWith(new Error('no author found with channelAddress: testaddress and identityId: did:iota:2345'));
		expect(nextMock).toHaveBeenCalledWith(new Error('could not revoke the subscription'));
	});

	it('should revoke the subscription', async () => {
		const channelAddress = 'testaddress';
		spyOn(subscriptionService, 'getSubscription').and.returnValues(authorSubscriptionMock, subscriptionMock);

		const updateSubscriptionStateSpy = jest.spyOn(subscriptionService, 'updateSubscriptionState');
		const sendKeyloadSpy = jest.spyOn(streamsService, 'sendKeyload').mockReturnValue({
			keyloadLink: 'testkeyloadlink',
			sequenceLink: 'testsequencelink',
			author: AuthorMock
		});
		const exportSubscriptionSpy = jest.spyOn(streamsService, 'exportSubscription').mockReturnValue('new-state');
		const setSubscriptionAuthorizedSpy = jest.spyOn(subscriptionService, 'setSubscriptionAuthorized');
		const removeSubscriptionSpy = jest.spyOn(SubscriptionDb, 'removeSubscription');
		const removeChannelDataSpy = jest.spyOn(ChannelDataDb, 'removeChannelData');

		spyOn(streamsService, 'importSubscription').mockReturnValue(AuthorMock);
		const getSubscriptionsSpy = jest.spyOn(SubscriptionDb, 'getSubscriptions').mockReturnValue([authorSubscriptionMock, subscriptionMock]);

		const req: any = {
			params: { channelAddress },
			user: { identityId: 'did:iota:1234' },
			body: { identityId: 'did:iota:2345' }
		};

		await subscriptionRoutes.revokeSubscription(req, res, nextMock);

		expect(getSubscriptionsSpy).toHaveBeenCalledWith(channelAddress);
		expect(sendKeyloadSpy).toHaveBeenCalledWith(
			'testsequencelink2',
			['test-author-public-key', 'test-author-public-key'],
			AuthorMock,
			authorSubscriptionMock.pskId
		);
		expect(setSubscriptionAuthorizedSpy).toHaveBeenCalledWith(
			channelAddress,
			authorSubscriptionMock.identityId,
			'testkeyloadlink',
			'testsequencelink'
		);
		expect(removeSubscriptionSpy).toHaveBeenCalledWith(channelAddress, subscriptionMock.identityId);
		expect(removeChannelDataSpy).toHaveBeenCalledWith(channelAddress, subscriptionMock.identityId);
		expect(updateSubscriptionStateSpy).toHaveBeenCalledWith(channelAddress, authorSubscriptionMock.identityId, 'new-state');
		expect(exportSubscriptionSpy).toHaveBeenCalledWith(AuthorMock, 'veryvery-very-very-server-secret');
		expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.OK);
	});
});
