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
import { isAuth } from '../middlewares/authentication';

const validator = new Validator({ allErrors: true });
const validate = validator.validate;

const userService = new UserService();
const userRoutes = new UserRoutes(userService);
const { getUser, searchUsers, addUser, updateUser, deleteUser } = userRoutes;
export const userRouter = Router();
const { serverSecret } = CONFIG;
const authMiddleWare = isAuth(serverSecret);

userRouter.get('/user/:userId', getUser);
userRouter.get('/search', authMiddleWare, searchUsers);
userRouter.post('/user', validate({ body: UserSchema }), addUser);
userRouter.put('/user', authMiddleWare, validate({ body: UserSchema }), updateUser);
userRouter.delete('/user/:userId', authMiddleWare, deleteUser);

const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;
export const channelInfoRouter = Router();

channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.get('/search', authMiddleWare, searchChannelInfo);
channelInfoRouter.post('/channel', authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', authMiddleWare, deleteChannelInfo);

const identityService = IdentityService.getInstance(CONFIG.identityConfig);
const authenticationService = new AuthenticationService(identityService, userService, serverSecret);
const authenticationRoutes = new AuthenticationRoutes(authenticationService, CONFIG);
const {
  createIdentity,
  verifyUser,
  checkVerifiableCredential,
  getChallenge,
  revokeVerifiableCredential,
  getLatestDocument,
  auth,
  getTrustedRootIdentities
} = authenticationRoutes;
export const authenticationRouter = Router();

authenticationRouter.get('/get-latest-document', getLatestDocument);
authenticationRouter.get('/get-trusted-roots', getTrustedRootIdentities);
authenticationRouter.get('/get-challenge/:userId', getChallenge);
authenticationRouter.post('/auth/:userId', auth);
authenticationRouter.post('/create-identity', validate({ body: UserWithoutIdSchema }), createIdentity);
authenticationRouter.post('/verify-user', authMiddleWare, validate({ body: UserCredentialSchema }), verifyUser);
authenticationRouter.post('/check-verification', authMiddleWare, checkVerifiableCredential);
authenticationRouter.post('/revoke-verification', authMiddleWare, revokeVerifiableCredential);
