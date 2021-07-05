import { Router } from 'express';
import { CONFIG } from '../../config';
import { AddChannelLogBodySchema, CreateChannelBodySchema } from '../../models/schemas/request-body/channel-bodies';
import { ChannelRoutes } from '../../routes/channel';
import { ChannelService } from '../../services/channel-service';
import { Logger } from '../../utils/logger';
import { channelInfoService } from '../channel-info';
import { apiKeyMiddleware, authMiddleWare, validate } from '../helper';
import { streamsService, subscriptionPool, subscriptionService } from '../subscription';

const config = CONFIG.streamsConfig;
export const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, subscriptionPool, config);
const channelRoutes = new ChannelRoutes(channelService, Logger.getInstance());
const { addLogs, createChannel, getLogs } = channelRoutes;

export const channelRouter = Router();

/**
 * @openapi
 * /channels/create:
 *   post:
 *     description: Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.
 *     tags:
 *     - channels
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/CreateChannelBodySchema"
 *     responses:
 *       201:
 *         description: Returns the created channel
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CreateChannelBodyResponseSchema"
 *       401:
 *         description: No valid api key provided / Not authenticated
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
channelRouter.post('/create', apiKeyMiddleware, authMiddleWare, validate({ body: CreateChannelBodySchema }), createChannel);

/**
 * @openapi
 * /channels/logs/{channelAddress}:
 *   post:
 *     description: Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.
 *     tags:
 *     - channels
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/AddChannelLogBodySchema"
 *     responses:
 *       200:
 *         description: Returns a link to the written data
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *       401:
 *         description: No valid api key provided / Not authenticated
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
channelRouter.post('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: AddChannelLogBodySchema }), addLogs);

/**
 * @openapi
 * /channels/logs/{channelAddress}:
 *   get:
 *     description: Get data from the channel with address channel address. The first possible message a subscriber can receive is the time the subscription got approved all messages before are not received. Read permission is mandatory.
 *     tags:
 *     - channels
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     responses:
 *       200:
 *         description: Returns data from the channel
 *         content: 
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ChannelDataSchema"
 *       401:
 *         description: No valid api key provided / Not authenticated
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
channelRouter.get('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, getLogs);
