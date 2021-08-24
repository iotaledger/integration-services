import { Router } from 'express';
import { AddChannelLogBodySchema, CreateChannelBodySchema, ReimportBodySchema } from '../../models/schemas/request-response-body/channel-bodies';
import { ChannelRoutes } from '../../routes/channel';
import { Logger } from '../../utils/logger';
import { channelService } from '../services';
import { apiKeyMiddleware, authMiddleWare, validate } from '../middlewares';

const channelRoutes = new ChannelRoutes(channelService, Logger.getInstance());
const { addLogs, createChannel, getLogs, getHistory, reimport } = channelRoutes;

export const channelRouter = Router();

/**
 * @openapi
 * /channels/create:
 *   post:
 *     summary: Create a new channel
 *     description: Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.
 *     tags:
 *     - channels
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateChannelBodySchema"
 *           example:
 *             topics:
 *             - type: example-channel-data
 *               source: channel-creator
 *             encrypted: false
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
 *     summary: Write data to a channel
 *     description: Write data to a channel with address channel address. Write permission is mandatory. The type and metadata fields are not encrypted to have a possibility to search for events. The payload is stored encrypted for encrypted channels.
 *     tags:
 *     - channels
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
 *             $ref: "#/components/schemas/AddChannelLogBodySchema"
 *           example:
 *             type: example-channel-data
 *             created: 2021-07-23T05:25:42.325Z
 *             metadata: example-meta-data
 *             payload:
 *               example: 1
 *     responses:
 *       200:
 *         description: Returns a link to the written data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ChannelDataSchema"
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
 *     summary: Get data from the channel
 *     description: Get data from the channel with address channel address. The first possible message a subscriber can receive is the time the subscription got approved all messages before are not received. Read permission is mandatory.
 *     tags:
 *     - channels
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
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
channelRouter.get('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, getLogs);

/**
 * @openapi
 * /channels/history/{channelAddress}:
 *   get:
 *     summary: Get history of a channel.
 *     description: Get all data of a channel using a preshared key. Mainly used by auditors to validate a log stream.
 *     tags:
 *     - channels
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 */
channelRouter.get('/history/:channelAddress', apiKeyMiddleware, getHistory);

/**
 * @openapi
 * /channel-info/validate:
 *   post:
 *     summary: TBD!
 *     description: Validates data of a channel.
 *     tags:
 *     - channels
 *     deprecated: true
 */

/**
 * @openapi
 * /channel-info/re-import/{channelAddress}:
 *   post:
 *     summary: Re import the data from the tangle into the database.
 *     description: The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.
 *     tags:
 *     - channels
 */
channelRouter.get('/re-import/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: ReimportBodySchema }), reimport);
