import { CONFIG } from '../config';
import { KEY_COLLECTION_SIZE } from '../config/identity';
import { AuthenticationService } from '../services/authentication-service';
import { AuthorizationService } from '../services/authorization-service';
import { ChannelInfoService } from '../services/channel-info-service';
import { ChannelService } from '../services/channel-service';
import { SsiService } from '../services/ssi-service';
import { StreamsService } from '../services/streams-service';
import { SubscriptionService } from '../services/subscription-service';
import { UserService } from '../services/user-service';
import { VerificationService } from '../services/verification-service';
import { Logger } from '../utils/logger';

const { serverSecret, identityConfig, serverIdentityId, jwtExpiration, streamsConfig } = CONFIG;

export const ssiService = SsiService.getInstance(identityConfig, Logger.getInstance());
export const authorizationService = new AuthorizationService();
export const userService = new UserService(ssiService, serverSecret, Logger.getInstance());
export const authenticationService = new AuthenticationService(userService, ssiService, { jwtExpiration, serverSecret });

export const channelInfoService = new ChannelInfoService(userService);
export const streamsService = new StreamsService(streamsConfig, Logger.getInstance());
export const subscriptionService = new SubscriptionService(streamsService, channelInfoService, streamsConfig);
export const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, streamsConfig);

export const verificationService = new VerificationService(
	ssiService,
	userService,
	{
		serverIdentityId,
		serverSecret,
		keyCollectionSize: KEY_COLLECTION_SIZE
	},
	Logger.getInstance()
);
