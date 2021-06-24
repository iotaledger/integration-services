import { Router } from 'express';
import { ChannelInfoSchema } from '../../models/schemas/channel-info';
import { ChannelInfoRoutes } from '../../routes/channel-info';
import { ChannelInfoService } from '../../services/channel-info-service';
import { apiKeyMiddleware, authMiddleWare, authorizationService, logger, validate } from '../helper';
import { userService } from '../identity';

export const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService, logger);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;

export const channelInfoRouter = Router();
channelInfoRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchChannelInfo);
channelInfoRouter.get('/channel/:channelAddress', apiKeyMiddleware, getChannelInfo);
channelInfoRouter.post('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', apiKeyMiddleware, authMiddleWare, deleteChannelInfo);
