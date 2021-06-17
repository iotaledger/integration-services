import { ChannelInfoRoutes } from './channel-info';
import { IdentityRoutes } from './identity';
import { Validator } from 'express-json-validator-middleware';
import { Router } from 'express';
import { ChannelInfoSchema } from '../models/schemas/channel-info';
import { UserSchema } from '../models/schemas/user';
import { VerificationRoutes } from './verification';
import { VerificationService } from '../services/verification-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { ChannelInfoService } from '../services/channel-info-service';
import { SsiService } from '../services/ssi-service';
import {
	RevokeVerificationBodySchema,
	VerifiableCredentialBodySchema,
	VerifyIdentityBodySchema
} from '../models/schemas/request-body/verification-bodies';
import { isAuth } from '../middlewares/authentication';
import { AuthorizationService } from '../services/authorization-service';
import { ChannelRoutes } from './channel';
import { StreamsService } from '../services/streams-service';
import { ChannelService } from '../services/channel-service';
import { SubscriptionService } from '../services/subscription-service';
import { SubscriptionRoutes } from './subscription';
import {
	AddChannelLogBodySchema,
	AuthorizeSubscriptionBodySchema,
	CreateChannelBodySchema,
	RequestSubscriptionBodySchema
} from '../models/schemas/request-body/channel-bodies';
import { hasValidApiKey } from '../middlewares/api-key';
import { AuthenticationRoutes } from './authentication';
import { AuthenticationService } from '../services/authentication-service';
import { KEY_COLLECTION_SIZE } from '../config/identity';
import { SubscriptionPool } from '../pools/subscription-pools';
import { CreateUserBodySchema, UpdateUserBodySchema } from '../models/schemas/request-body/user-bodies';
import { ProveOwnershipPostBodySchema as ProveOwnershipBodySchema } from '../models/schemas/request-body/authentication-bodies';

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

identityRouter.post('/create', apiKeyMiddleware, validate({ body: CreateUserBodySchema }), createIdentity);
identityRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchUsers);
identityRouter.get('/identity/:identityId', apiKeyMiddleware, getUser);
identityRouter.post('/identity', apiKeyMiddleware, validate({ body: UserSchema }), addUser);
identityRouter.put('/identity', apiKeyMiddleware, authMiddleWare, validate({ body: UpdateUserBodySchema }), updateUser);
identityRouter.delete('/identity/:identityId', apiKeyMiddleware, authMiddleWare, deleteUser);

const channelInfoService = new ChannelInfoService(userService);
const channelInfoRoutes = new ChannelInfoRoutes(channelInfoService, authorizationService);
const { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo, searchChannelInfo } = channelInfoRoutes;
export const channelInfoRouter = Router();

channelInfoRouter.get('/search', apiKeyMiddleware, authMiddleWare, searchChannelInfo);
channelInfoRouter.get('/channel/:channelAddress', apiKeyMiddleware, getChannelInfo);
channelInfoRouter.post('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), addChannelInfo);
channelInfoRouter.put('/channel', apiKeyMiddleware, authMiddleWare, validate({ body: ChannelInfoSchema }), updateChannelInfo);
channelInfoRouter.delete('/channel/:channelAddress', apiKeyMiddleware, authMiddleWare, deleteChannelInfo);

const authenticationService = new AuthenticationService(userService, ssiService, { jwtExpiration, serverSecret });
const authenticationRoutes = new AuthenticationRoutes(authenticationService);
const { getNonce, proveOwnership } = authenticationRoutes;
export const authenticationRouter = Router();
authenticationRouter.get('/prove-ownership/:identityId', apiKeyMiddleware, getNonce);
authenticationRouter.post('/prove-ownership/:identityId', apiKeyMiddleware, validate({ body: ProveOwnershipBodySchema }), proveOwnership);

const verificationService = new VerificationService(ssiService, userService, {
	serverIdentityId,
	serverSecret,
	keyCollectionSize: KEY_COLLECTION_SIZE
});
const verificationRoutes = new VerificationRoutes(verificationService, authorizationService, CONFIG);
const {
	createVerifiableCredential,
	checkVerifiableCredential,
	revokeVerifiableCredential,
	getLatestDocument,
	getTrustedRootIdentities
} = verificationRoutes;
export const verificationRouter = Router();
verificationRouter.get('/latest-document/:identityId', apiKeyMiddleware, getLatestDocument);
verificationRouter.get('/trusted-roots', apiKeyMiddleware, getTrustedRootIdentities);
verificationRouter.post(
	'/create-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: VerifyIdentityBodySchema }),
	createVerifiableCredential
);
verificationRouter.post('/check-credential', apiKeyMiddleware, validate({ body: VerifiableCredentialBodySchema }), checkVerifiableCredential);
verificationRouter.post(
	'/revoke-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RevokeVerificationBodySchema }),
	revokeVerifiableCredential
);

const subscriptionPool = new SubscriptionPool(streamsNode);
subscriptionPool.startInterval();
const streamsService = new StreamsService(streamsNode);
const streamsConfig = { statePassword: serverSecret, streamsNode };
const subscriptionService = new SubscriptionService(streamsService, channelInfoService, subscriptionPool, streamsConfig);
const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, subscriptionPool, streamsConfig);

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
