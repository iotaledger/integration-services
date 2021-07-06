import { Router } from 'express';
import { CONFIG } from '../../config';
import { AuthorizeSubscriptionBodySchema, RequestSubscriptionBodySchema } from '../../models/schemas/request-response-body/channel-bodies';
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
 * /subscriptions/subscriptions/{channelAddress}:
 *   get:
 *     summary: TBD!
 *     description: Get all subscriptions of a channel.
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     deprecated: true
 */

/**
 * @openapi
 * /subscriptions/remove/{channelAddress}:
 *   post:
 *     summary: TBD!
 *     description: Remove subscription to a channel. The author or subscriber of a channel can remove a subscription from a channel. (A subscriber can only remove its own subscription)
 *     tags:
 *     - subscriptions
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     deprecated: true
 */

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
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address  
 *     security:
 *       - BearerAuth: []
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
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               $ref: '#/components/schemas/ErrorResponseSchema'          
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
 *       schema:
 *         $ref: "#/components/schemas/ChannelAddressSchema"
 *       examples:
 *         channelAddress:
 *           value: 5179bbd9714515aaebde8966c8cd17d3864795707364573b2f58d919364c63f70000000000000000:6d3cf83c5b57e5e5ab024f47
 *           summary: Example channel address  
 *     security:
 *       - BearerAuth: []
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
 *               $ref: '#/components/schemas/ErrorResponseSchema'  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               $ref: '#/components/schemas/ErrorResponseSchema'           
 */
subscriptionRouter.post(
	'/authorize/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: AuthorizeSubscriptionBodySchema }),
	authorizeSubscription
);
