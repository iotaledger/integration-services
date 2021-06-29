import { Router } from 'express';
import { CONFIG } from '../../config';
import { AuthorizeSubscriptionBodySchema, RequestSubscriptionBodySchema } from '../../models/schemas/request-body/channel-bodies';
import { SubscriptionPool } from '../../pools/subscription-pools';
import { SubscriptionRoutes } from '../../routes/subscription';
import { StreamsService } from '../../services/streams-service';
import { SubscriptionService } from '../../services/subscription-service';
import { Logger } from '../../utils/logger';
import { channelInfoService } from '../channel-info';
import { apiKeyMiddleware, authMiddleWare, validate } from '../helper';

const config = CONFIG.streamsConfig;
export const subscriptionPool = new SubscriptionPool(config.node);
subscriptionPool.startInterval();

export const streamsService = new StreamsService(config.node, Logger.getInstance());
export const subscriptionService = new SubscriptionService(streamsService, channelInfoService, subscriptionPool, config);
const subscriptionRoutes = new SubscriptionRoutes(subscriptionService, Logger.getInstance());
const { getSubscriptions, requestSubscription, authorizeSubscription } = subscriptionRoutes;

export const subscriptionRouter = Router();

subscriptionRouter.get('/subscription/:channelAddress', apiKeyMiddleware, authMiddleWare, getSubscriptions);
subscriptionRouter.post(
	'/request/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RequestSubscriptionBodySchema }),
	requestSubscription
);

subscriptionRouter.post(
	'/authorize/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: AuthorizeSubscriptionBodySchema }),
	authorizeSubscription
);
