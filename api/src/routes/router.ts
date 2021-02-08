import { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo } from './channel-info';
import { Router } from 'express';

export const channelInfoRouter = Router();
channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.post('/channel', addChannelInfo);
channelInfoRouter.put('/channel', updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', deleteChannelInfo);
