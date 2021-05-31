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
import { RevokeVerificationSchema, VerifyIdentitySchema } from '../models/schemas/authentication';
import { isAuth } from '../middlewares/authentication';
import { AuthorizationService } from '../services/authorization-service';
import { VerifiableCredentialSchema } from '../models/schemas/identity';
import { ChannelRoutes } from './channel';
import { StreamsService } from '../services/streams-service';
import { ChannelService } from '../services/channel-service';
import { SubscriptionService } from '../services/subscription-service';
import { SubscriptionRoutes } from './subscription';
import {
	AddChannelLogBodySchema,
	AuthorizeSubscriptionBodySchema,
	CreateChannelBodySchema,
	ProveOwnershipPostBodySchema,
	RequestSubscriptionBodySchema
} from '../models/schemas/request-bodies';
import { hasValidApiKey } from '../middlewares/api-key';

const validator = new Validator({ allErrors: true });
const validate = validator.validate;

const userService = new UserService();
const authorizationService = new AuthorizationService(userService);
const userRoutes = new UserRoutes(userService, authorizationService);
const { getUser, searchUsers, addUser, updateUser, deleteUser } = userRoutes;
export const userRouter = Router();
const { serverSecret, jwtExpiration, serverIdentityId, streamsNode, apiKey } = CONFIG;
const authMiddleWare = isAuth(serverSecret);
const apiKeyMiddleware = hasValidApiKey(apiKey);

userRouter.get('/user/:userId', apiKeyMiddleware, getUser);
userRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchUsers);
userRouter.post('/user', apiKeyMiddleware, validate({ body: UserSchema }), addUser);
userRouter.put('/user', apiKeyMiddleware, authMiddleWare, validate({ body: UpdateUserSchema }), updateUser);
userRouter.delete('/user/:userId', apiKeyMiddleware, authMiddleWare, deleteUser);

const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;
export const channelInfoRouter = Router();

channelInfoRouter.get('/channel/:channelAddress', apiKeyMiddleware, getChannelInfo);
channelInfoRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchChannelInfo);
channelInfoRouter.post('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', apiKeyMiddleware, authMiddleWare, deleteChannelInfo);

const identityService = IdentityService.getInstance(CONFIG.identityConfig);
const authenticationService = new AuthenticationService(identityService, userService, { jwtExpiration, serverIdentityId, serverSecret });
const authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, authorizationService, CONFIG);
const {
	createIdentity,
	verifyIdentity,
	checkVerifiableCredential,
	getNonce,
	revokeVerifiableCredential,
	getLatestDocument,
	proveOwnership,
	getTrustedRootIdentities
} = authenticationRoutes;
export const authenticationRouter = Router();

authenticationRouter.get('/latest-document/:userId', apiKeyMiddleware, getLatestDocument);
authenticationRouter.get('/trusted-roots', apiKeyMiddleware, getTrustedRootIdentities);
authenticationRouter.get('/prove-ownership/:userId', apiKeyMiddleware, getNonce);
authenticationRouter.post('/prove-ownership/:userId', apiKeyMiddleware, validate({ body: ProveOwnershipPostBodySchema }), proveOwnership);
authenticationRouter.post('/create-identity', apiKeyMiddleware, validate({ body: UserWithoutIdSchema }), createIdentity);
authenticationRouter.post('/verify-identity', apiKeyMiddleware, authMiddleWare, validate({ body: VerifyIdentitySchema }), verifyIdentity);
authenticationRouter.post('/check-verification', apiKeyMiddleware, validate({ body: VerifiableCredentialSchema }), checkVerifiableCredential);
authenticationRouter.post(
	'/revoke-verification',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RevokeVerificationSchema }),
	revokeVerifiableCredential
);

const streamsService = new StreamsService(streamsNode);
const streamsConfig = { statePassword: serverSecret, streamsNode };
const subscriptionService = new SubscriptionService(streamsService, channelInfoService, streamsConfig);
const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, streamsConfig);

const channelRoutes = new ChannelRoutes(channelService);
const { addLogs, createChannel, getLogs } = channelRoutes;
export const channelRouter = Router();
channelRouter.post('/create', apiKeyMiddleware, authMiddleWare, validate({ body: CreateChannelBodySchema }), createChannel);
channelRouter.post('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, validate({ body: AddChannelLogBodySchema }), addLogs);
channelRouter.get('/logs/:channelAddress', apiKeyMiddleware, authMiddleWare, getLogs);

const subscriptionRoutes = new SubscriptionRoutes(subscriptionService);
const { getSubscriptions, requestSubscription, authorizeSubscription } = subscriptionRoutes;
export const subscriptionRouter = Router();
subscriptionRouter.get('/subscription/:channelAddress', apiKeyMiddleware, authMiddleWare, getSubscriptions);
subscriptionRouter.post(
	'/request/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RequestSubscriptionBodySchema }),
	requestSubscription
);
subscriptionRouter.post(
	'/authorize/:channelAddress',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: AuthorizeSubscriptionBodySchema }),
	authorizeSubscription
);
