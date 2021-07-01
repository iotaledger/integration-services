import { StatusCodes } from 'http-status-codes';
import { SubscriptionRoutes } from '.';
import { AccessRights } from '../../models/types/subscription';
import { SubscriptionPool } from '../../pools/subscription-pools';
import { ChannelInfoService } from '../../services/channel-info-service';
import { StreamsService } from '../../services/streams-service';
import { SubscriptionService } from '../../services/subscription-service';
import { UserService } from '../../services/user-service';
import { StreamsConfigMock } from '../../test/mocks/config';
import { LoggerMock } from '../../test/mocks/logger';

describe('test subscription routes', () => {
	let sendMock: any, sendStatusMock: any, nextMock: any, res: any;
	let subscriptionRoutes: SubscriptionRoutes, streamsService: StreamsService;
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
		subscriptionRoutes = new SubscriptionRoutes(subscriptionService, LoggerMock);

		res = {
			send: sendMock,
			sendStatus: sendStatusMock,
			status: jest.fn(() => res)
		};
	});

	describe('test requestSubscription route', () => {
		it('should call nextMock if no body is provided', async () => {
			const loggerSpy = spyOn(LoggerMock, 'error');
			const req: any = {
				params: {},
				user: { identityId: undefined },
				body: undefined // no body
			};

			await subscriptionRoutes.requestSubscription(req, res, nextMock);
			expect(loggerSpy).toHaveBeenCalledWith(new Error("Cannot read property 'seed' of undefined"));
			expect(nextMock).toHaveBeenCalledWith(new Error('could not request the subscription'));
		});

		it('should bad request if no identityId is provided', async () => {
			const req: any = {
				params: {},
				user: { identityId: undefined }, //no identityId,
				body: { accessRights: AccessRights.Read }
			};

			await subscriptionRoutes.requestSubscription(req, res, nextMock);
			expect(res.sendStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it('should return bad request since already a subscription is requested', async () => {
			spyOn(subscriptionService, 'getSubscription').and.returnValue({}); // already a subscription is found!
			const req: any = {
				params: {},
				user: { identityId: 'did:iota1234' },
				body: { accessRights: AccessRights.Read }
			};

			await subscriptionRoutes.requestSubscription(req, res, nextMock);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.send).toHaveBeenCalledWith('subscription already requested');
		});
	});
});
