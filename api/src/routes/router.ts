import { ChannelInfoRoutes } from './channel-info';
import { UserRoutes } from './user';
import { Validator } from 'express-json-validator-middleware';
import { Router } from 'express';
import { ChannelInfoSchema } from '../models/schemas/channel-info';
import { UpdateUserSchema, UserSchema, UserWithoutIdSchema } from '../models/schemas/user';
import { AuthenticationRoutes } from './authentication';
import { AuthenticationService } from '../services/authentication-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { ChannelInfoService } from '../services/channel-info-service';
import { IdentityService } from '../services/identity-service';
import { RevokeVerificationSchema, VerifyUserSchema } from '../models/schemas/authentication';
import { isAuth } from '../middlewares/authentication';
import { AuthorizationService } from '../services/authorization-service';
import { VerifiableCredentialSchema } from '../models/schemas/identity';
import { ChannelRoutes } from './channel';
import { StreamsService } from '../services/streams-service';
import { ChannelService } from '../services/channel-service';
import { SubscriptionService } from '../services/subscription-service';
import { SubscriptionRoutes } from './subscription';

const validator = new Validator({ allErrors: true });
const validate = validator.validate;

const userService = new UserService();
const authorizationService = new AuthorizationService(userService);
const userRoutes = new UserRoutes(userService, authorizationService);
const { getUser, searchUsers, addUser, updateUser, deleteUser } = userRoutes;
export const userRouter = Router();
const { serverSecret, jwtExpiration, serverIdentityId } = CONFIG;
const authMiddleWare = isAuth(serverSecret);

userRouter.get('/user/:userId', getUser);
userRouter.get('/search', authMiddleWare, searchUsers);
userRouter.post('/user', validate({ body: UserSchema }), addUser);
userRouter.put('/user', authMiddleWare, validate({ body: UpdateUserSchema }), updateUser);
userRouter.delete('/user/:userId', authMiddleWare, deleteUser);

const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;
export const channelInfoRouter = Router();

channelInfoRouter.get('/channel/:channelAddress', getChannelInfo);
channelInfoRouter.get('/search', authMiddleWare, searchChannelInfo);
channelInfoRouter.post('/channel', authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', authMiddleWare, deleteChannelInfo);

const identityService = IdentityService.getInstance(CONFIG.identityConfig);
const authenticationService = new AuthenticationService(identityService, userService, { jwtExpiration, serverIdentityId, serverSecret });
const authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, authorizationService, CONFIG);
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

authenticationRouter.get('/latest-document/:userId', getLatestDocument);
authenticationRouter.get('/trusted-roots', getTrustedRootIdentities);
authenticationRouter.get('/challenge/:userId', getChallenge);
authenticationRouter.post('/auth/:userId', auth);
authenticationRouter.post('/create-identity', validate({ body: UserWithoutIdSchema }), createIdentity);
authenticationRouter.post('/verify-user', authMiddleWare, validate({ body: VerifyUserSchema }), verifyUser);
authenticationRouter.post('/check-verification', validate({ body: VerifiableCredentialSchema }), checkVerifiableCredential);
authenticationRouter.post('/revoke-verification', authMiddleWare, validate({ body: RevokeVerificationSchema }), revokeVerifiableCredential);

const streamsService = new StreamsService();
const channelService = new ChannelService(streamsService, channelInfoService);
const channelRoutes = new ChannelRoutes(channelService);
export const channelRouter = Router();
channelRouter.post('/create', authMiddleWare, channelRoutes.createChannel);
channelRouter.post('/logs', channelRoutes.addLogs);
channelRouter.get('/logs', channelRoutes.getLogs);

const subscriptionService = new SubscriptionService(streamsService, channelInfoService);
const subscriptionRoutes = new SubscriptionRoutes(subscriptionService);
export const subscriptionRouter = Router();
subscriptionRouter.get('/subscription/:channelAddress', authMiddleWare, subscriptionRoutes.getSubscriptions);
subscriptionRouter.post('/request/:channelAddress', authMiddleWare, subscriptionRoutes.requestSubscription);
subscriptionRouter.post('/authorize/:channelAddress', authMiddleWare, subscriptionRoutes.authorizeSubscription);
