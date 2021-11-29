import { Router } from 'express';
import {
	AddChannelLogBodySchema,
	CreateChannelBodySchema,
	ReimportBodySchema,
	ValidateBodySchema
} from '../../models/schemas/request-response-body/channel-bodies';
import { ChannelRoutes } from '../../routes/channel';
import { Logger } from '../../utils/logger';
import { channelService } from '../services';
import { apiKeyMiddleware, authMiddleWare, validate } from '../middlewares';

const channelRoutes = new ChannelRoutes(channelService, Logger.getInstance());
const { addLogs, createChannel, getLogs, getHistory, reimport, validateLogs } = channelRoutes;

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
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateChannelBodySchema"
 *           example:
 *             topics:
 *             - type: example-channel-data
 *               source: channel-creator
 *     responses:
 *       201:
 *         description: Returns the created channel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CreateChannelResponseSchema"
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
 *       - ApiKey: []
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
 *     - name: limit
 *       in: query
 *       required: false
 *       schema:
 *         type: number
 *         example: 5
 *     - name: index
 *       in: query
 *       required: false
 *       schema:
 *         type: number
 *     - name: asc
 *       in: query
 *       required: false
 *       schema:
 *         type: boolean
 *         example: true
 *     - name: 'start-date'
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *         format: date-time
 *         example: 2021-09-27T13:30:00+02:00
 *     - name: 'end-date'
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *         format: date-time
 *         example: 2021-09-29T13:30:00+02:00
 *     security:
 *       - BearerAuth: []
 *       - ApiKey: []
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
 *     summary: Get the history of a channel.
 *     description: Get all data of a channel using a shared key (in case of encrypted channels). Mainly used from auditors to evaluate a log stream.
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
 *     - name: 'preshared-key'
 *       in: query
 *       required: true
 *       description: Preshared key defined by the author to encrypt/decrypt data.
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Received history.
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
channelRouter.get('/history/:channelAddress', apiKeyMiddleware, getHistory);

/**
 * @openapi
 * /channels/validate/{channelAddress}:
 *   post:
 *     summary: Validates channel data by comparing the log of each link with the data on the tangle.
 *     description: Validates data of a channel.
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
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ValidateBodySchema"
 *     responses:
 *       200:
 *         description: Returns validated result.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ValidateResponseSchema"
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
channelRouter.post('/validate/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: ValidateBodySchema }), validateLogs);

/**
 * @openapi
 * /channels/re-import/{channelAddress}:
 *   post:
 *     summary: Re import the data from the tangle into the database.
 *     description: The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data.
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
 *       - ApiKey: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ReimportBodySchema"
 *           example:
 *             seed: string
 *             subscriptionPassword: string
 *     responses:
 *       200:
 *         description: Reimport successful.
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
channelRouter.post('/re-import/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: ReimportBodySchema }), reimport);
