import { Router } from 'express';
import { ChannelInfoSchema } from '../../models/schemas/channel-info';
import { ChannelInfoRoutes } from '../../routes/channel-info';
import { Logger } from '../../utils/logger';
import { authorizationService, channelInfoService } from '../services';
import { apiKeyMiddleware, authMiddleWare, validate } from '../middlewares';

const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, Logger.getInstance());
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;

export const channelInfoRouter = Router();

/**
 * @openapi
 * /channel-info/search:
 *   get:
 *     summary: Search for a channel
 *     description: Search for a channel. A client can search for a channel which it is interested in.
 *     tags:
 *     - channel-info
 *     parameters:
 *     - name: query
 *       in: query
 *       required: false
 *       schema:
 *         type: object
 *         properties:
 *           author:
 *             type: string
 *           'topic-type':
 *             type: string
 *           'topic-source':
 *             type: string
 *           created:
 *             type: string
 *             format: date-time
 *           'latest-message':
 *             type: string
 *           limit:
 *             type: number
 *           index:
 *             type: number
 *         example:
 *           author: null
 *           'topic-type': example-channel-data
 *           'topic-source': null
 *           created: null
 *           'latest-message': null
 *           limit: null
 *           index: null
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns information about searched channels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/ChannelInfoSchema"
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
channelInfoRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchChannelInfo);

/**
 * @openapi
 * /channel-info/channel/{channelAddress}:
 *   get:
 *     summary: Get information about a channel
 *     description: Get information about a channel with address channel-address.
 *     tags:
 *     - channel-info
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
 *     responses:
 *       200:
 *         description: Returns information about the channel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ChannelInfoSchema"
 *       401:
 *         description: No valid api key provided
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
channelInfoRouter.get('/channel/:channelAddress', apiKeyMiddleware, getChannelInfo);

/**
 * @openapi
 * /channel-info/channel:
 *   post:
 *     summary: Add an existing channel into the database
 *     description: Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.
 *     tags:
 *     - channel-info
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ChannelInfoSchema"
 *           example:
 *             channelAddress: 186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e
 *             authorId: did:iota:3yKgJoNyH9BEZ5Sh1YuHXAJeNARVqvEJLN87kd2ctm4h
 *             subscriberIds:
 *             - did:iota:D2hAY4ETPv2YFjyXQpeijgNp1bb1MijmXtiBJNNKx1NE
 *             - did:iota:9aJBqphbRMpdgAunuSE7iLKpEhu991ZQLUQutF6HWDpJ
 *             latestLink: 186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:8ff362973ecc2cfd62831acb
 *             encrypted: false
 *             topics:
 *             - type: example-channel-data
 *               source: channel-creator
 *             created: 2021-07-23T13:45:30.680Z
 *             latestMessage: 2021-07-23T13:45:30.680Z
 *     responses:
 *       201:
 *         description: Channel successfully added
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
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
channelInfoRouter.post('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);

/**
 * @openapi
 * /channel-info/channel:
 *   put:
 *     summary: Update channel information
 *     description: Update channel information. The author of a channel can update topics of a channel.
 *     tags:
 *     - channel-info
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ChannelInfoSchema"
 *           example:
 *             channelAddress: 186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e
 *             authorId: did:iota:3yKgJoNyH9BEZ5Sh1YuHXAJeNARVqvEJLN87kd2ctm4h
 *             subscriberIds:
 *             - did:iota:D2hAY4ETPv2YFjyXQpeijgNp1bb1MijmXtiBJNNKx1NE
 *             - did:iota:9aJBqphbRMpdgAunuSE7iLKpEhu991ZQLUQutF6HWDpJ
 *             latestLink: 186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:8ff362973ecc2cfd62831acb
 *             encrypted: false
 *             topics:
 *             - type: example-channel-data
 *               source: channel-creator
 *             created: 2021-07-23T13:45:30.680Z
 *             latestMessage: 2021-07-23T13:45:30.680Z
 *     responses:
 *       200:
 *         description: Channel successfully added
 *       401:
 *         description: No valid api key provided/ Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
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
channelInfoRouter.put('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);

/**
 * @openapi
 * /channel-info/channel/{channelAddress}:
 *   delete:
 *     summary: Delete information of a channel
 *     description: Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!
 *     tags:
 *     - channel-info
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
 *         description: Channel successfully deleted
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
channelInfoRouter.delete('/channel/:channelAddress', apiKeyMiddleware, authMiddleWare, deleteChannelInfo);
