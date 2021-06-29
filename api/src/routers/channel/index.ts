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
channelRouter.post('/create', apiKeyMiddleware, authMiddleWare, validate({ body: CreateChannelBodySchema }), createChannel);
channelRouter.post('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: AddChannelLogBodySchema }), addLogs);
channelRouter.get('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, getLogs);
