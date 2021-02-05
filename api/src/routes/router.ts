import { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo } from './channel-info';
import { Router } from 'express';

export const channelInfoRouter = Router();
channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.post('/channel/:channelAddress', addChannelInfo);
channelInfoRouter.put('/channel/:channelAddress', updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', deleteChannelInfo);
