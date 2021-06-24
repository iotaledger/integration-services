import { Router } from 'express';
import { AddChannelLogBodySchema, CreateChannelBodySchema } from '../../models/schemas/request-body/channel-bodies';
import { ChannelRoutes } from '../../routes/channel';
import { ChannelService } from '../../services/channel-service';
import { channelInfoService } from '../channel-info';
import { apiKeyMiddleware, authMiddleWare, logger, validate } from '../helper';
import { streamsConfig, streamsService, subscriptionPool, subscriptionService } from '../subscription';

export const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, subscriptionPool, streamsConfig);
const channelRoutes = new ChannelRoutes(channelService, logger);
const { addLogs, createChannel, getLogs } = channelRoutes;

export const channelRouter = Router();
channelRouter.post('/create', apiKeyMiddleware, authMiddleWare, validate({ body: CreateChannelBodySchema }), createChannel);
channelRouter.post('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: AddChannelLogBodySchema }), addLogs);
channelRouter.get('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, getLogs);
