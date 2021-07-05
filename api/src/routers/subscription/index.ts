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

/**
 * @openapi
 * /subscriptions/request/{channelAddress}:
 *   post:
 *     summary: Request subscription to a channel
 *     description: Request subscription to a channel with address channel-address. A client can request a subscription to a channel which it then is able to read/write from. The subscriber can use an already generated seed or let it generate by the api so in this case the seed should be undefined.
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/RequestSubscriptionBodySchema"
 *     responses:
 *       201:
 *         description: Link to requested subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthorizeSubscriptionBodySchema"
 * 
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string    
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string             
 */
subscriptionRouter.post(
	'/request/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RequestSubscriptionBodySchema }),
	requestSubscription
);

/**
 * @openapi
 * /subscriptions/authorize/{channelAddress}:
 *   post:
 *     summary: Authorize a subscription to a channel
 *     description: Authorize a subscription to a channel with address channel-address. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the Ecommerce-SSI Bridge).
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/RequestSubscriptionBodySchema"
 *     responses:
 *       200:
 *         description: Link to requested subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthorizeSubscriptionBodyResponse"
 * 
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string    
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string             
 */
subscriptionRouter.post(
	'/authorize/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: AuthorizeSubscriptionBodySchema }),
	authorizeSubscription
);
