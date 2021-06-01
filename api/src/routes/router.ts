import { ChannelInfoRoutes } from './channel-info';
import { IdentityRoutes } from './identity';
import { Validator } from 'express-json-validator-middleware';
import { Router } from 'express';
import { ChannelInfoSchema } from '../models/schemas/channel-info';
import { UpdateUserSchema, UserSchema, UserWithoutIdSchema } from '../models/schemas/user';
import { AuthenticationRoutes } from './authentication';
import { AuthenticationService } from '../services/authentication-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { ChannelInfoService } from '../services/channel-info-service';
import { SsiService } from '../services/ssi-service';
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

const { serverSecret, jwtExpiration, serverIdentityId, streamsNode, apiKey } = CONFIG;
const validator = new Validator({ allErrors: true });
const validate = validator.validate;
const ssiService = SsiService.getInstance(CONFIG.identityConfig);

const userService = new UserService(ssiService, serverSecret);
const authorizationService = new AuthorizationService(userService);
const identityRoutes = new IdentityRoutes(userService, authorizationService);
const { createIdentity, getUser, searchUsers, addUser, updateUser, deleteUser } = identityRoutes;
export const identityRouter = Router();
const authMiddleWare = isAuth(serverSecret);
const apiKeyMiddleware = hasValidApiKey(apiKey);

identityRouter.post('/create-identity', apiKeyMiddleware, validate({ body: UserWithoutIdSchema }), createIdentity);
identityRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchUsers);
identityRouter.get('/identity/:identityId', apiKeyMiddleware, getUser);
identityRouter.post('/identity', apiKeyMiddleware, validate({ body: UserSchema }), addUser);
identityRouter.put('/identity', apiKeyMiddleware, authMiddleWare, validate({ body: UpdateUserSchema }), updateUser);
identityRouter.delete('/identity/:identityId', apiKeyMiddleware, authMiddleWare, deleteUser);

const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;
export const channelInfoRouter = Router();

channelInfoRouter.get('/channel/:channelAddress', apiKeyMiddleware, getChannelInfo);
channelInfoRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchChannelInfo);
channelInfoRouter.post('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', apiKeyMiddleware, authMiddleWare, deleteChannelInfo);

const authenticationService = new AuthenticationService(ssiService, userService, { jwtExpiration, serverIdentityId, serverSecret });
const authenticationRoutes = new AuthenticationRoutes(authenticationService, userService, authorizationService, CONFIG);
const {
	createVerifiableCredential,
	checkVerifiableCredential,
	revokeVerifiableCredential,
	getLatestDocument,
	getNonce,
	proveOwnership,
	getTrustedRootIdentities
} = authenticationRoutes;
export const authenticationRouter = Router();

authenticationRouter.get('/latest-document/:identityId', apiKeyMiddleware, getLatestDocument);
authenticationRouter.get('/trusted-roots', apiKeyMiddleware, getTrustedRootIdentities);
authenticationRouter.get('/prove-ownership/:identityId', apiKeyMiddleware, getNonce);
authenticationRouter.post('/prove-ownership/:identityId', apiKeyMiddleware, validate({ body: ProveOwnershipPostBodySchema }), proveOwnership);
authenticationRouter.post(
	'/create-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: VerifyIdentitySchema }),
	createVerifiableCredential
);
authenticationRouter.post('/check-credential', apiKeyMiddleware, validate({ body: VerifiableCredentialSchema }), checkVerifiableCredential);
authenticationRouter.post(
	'/revoke-credential',
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
