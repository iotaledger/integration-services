import { Router } from 'express';
import { ChannelInfoSchema } from '../../models/schemas/channel-info';
import { ChannelInfoRoutes } from '../../routes/channel-info';
import { ChannelInfoService } from '../../services/channel-info-service';
import { Logger } from '../../utils/logger';
import { apiKeyMiddleware, authMiddleWare, authorizationService, validate } from '../helper';
import { userService } from '../identity';

export const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, Logger.getInstance());
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;

export const channelInfoRouter = Router();

/**
 * @openapi
 * /channel-info/search:
 *   get:
 *     description: Search for a channel. A client can search for a channel which it is interested in.
 *     tags:
 *     - channel-info
 *     parameters:
 *     - name: query
 *       in: query
 *       required: false
 *       schema: 
 *         $ref: "#/components/schemas/ChannelInfoSearchSchema"
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
 *     description: Get information about a channel with address channel-address.
 *     tags:
 *     - channel-info
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
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
 *     description: Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.
 *     tags:
 *     - channel-info
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/ChannelInfoSchema"
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
 *     description: Update channel information. The author of a channel can update topics of a channel.
 *     tags:
 *     - channel-info
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/ChannelInfoSchema"
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
 *     description: Delete information of a channel with address channel-address. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!
 *     tags:
 *     - channel-info
 *     parameters:
 *     - name: channelAddress
 *       in: path
 *       required: true
 *     responses:
 *       200:
 *         description: Channel successfully deleted
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
channelInfoRouter.delete('/channel/:channelAddress', apiKeyMiddleware, authMiddleWare, deleteChannelInfo);
