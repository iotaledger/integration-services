import { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } from './channel-info';
import { getUser, addUser, updateUser, deleteUser, searchUsers } from './user';
import { Validator } from 'express-json-validator-middleware';
import { Router } from 'express';
import { ChannelInfoSchema } from '../models/data/channel-info';
import { UserSchema } from '../models/data/user';

const validator = new Validator({ allErrors: true });
const validate = validator.validate;

export const channelInfoRouter = Router();
channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.get('/search', searchChannelInfo);
channelInfoRouter.post('/channel', validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', deleteChannelInfo);

export const userRouter = Router();
userRouter.get('/user/:userId', getUser);
userRouter.get('/search', searchUsers);
userRouter.post('/user', validate({ body: UserSchema }), addUser);
userRouter.put('/user', updateUser);
userRouter.delete('/user/:userId', deleteUser);
