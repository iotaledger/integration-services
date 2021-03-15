import { ChannelInfoRoutes } from './channel-info';
import { UserRoutes } from './user';
import { Validator } from 'express-json-validator-middleware';
import { Router } from 'express';
import { ChannelInfoSchema } from '../models/data/channel-info';
import { UserSchema, UserWithoutIdSchema } from '../models/data/user';
import { AuthenticationRoutes } from './authentication';
import { AuthenticationService } from '../services/authentication-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { ChannelInfoService } from '../services/channel-info-service';
import { IdentityService } from '../services/identity-service';
import { UserCredentialSchema } from '../models/data/identity';

const validator = new Validator({ allErrors: true });
const validate = validator.validate;

const userService = new UserService();
const userRoutes = new UserRoutes(userService);
const { getUser, searchUsers, addUser, updateUser, deleteUser } = userRoutes;
export const userRouter = Router();

userRouter.get('/user/:userId', getUser);
userRouter.get('/search', searchUsers);
userRouter.post('/user', validate({ body: UserSchema }), addUser);
userRouter.put('/user', validate({ body: UserSchema }), updateUser);
userRouter.delete('/user/:userId', deleteUser);

const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;
export const channelInfoRouter = Router();

channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.get('/search', searchChannelInfo);
channelInfoRouter.post('/channel', validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', deleteChannelInfo);

const identityService = IdentityService.getInstance(CONFIG.identityConfig);
const authenticationService = new AuthenticationService(identityService, userService);
const authenticationRoutes = new AuthenticationRoutes(authenticationService, CONFIG);
const { createIdentity, createVerifiableCredential, checkVerifiableCredential, revokeVerifiableCredential, getLatestDocument } = authenticationRoutes;
export const authenticationRouter = Router();

authenticationRouter.get('/get-latest-document', getLatestDocument);
authenticationRouter.post('/create-identity', validate({ body: UserWithoutIdSchema }), createIdentity);
authenticationRouter.post('/add-verification', validate({ body: UserCredentialSchema }), createVerifiableCredential);
authenticationRouter.post('/check-verification', checkVerifiableCredential);
authenticationRouter.post('/revoke-verification', revokeVerifiableCredential);
