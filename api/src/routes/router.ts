import { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo } from './channel-info';
import { getUser, addUser, updateUser, deleteUser } from './user';
import { Router } from 'express';

export const channelInfoRouter = Router();
channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.post('/channel', addChannelInfo);
channelInfoRouter.put('/channel', updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', deleteChannelInfo);

export const userRouter = Router();
userRouter.get('/user/:userId', getUser);
userRouter.post('/user', addUser);
userRouter.put('/user', updateUser);
userRouter.delete('/user/:userId', deleteUser);
