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
import { ConfigurationService } from '../services/configuration-service';
const logger = Logger.getInstance();
const configService = ConfigurationService.getInstance(logger);
const { serverSecret, identityConfig, jwtExpiration, streamsConfig } = configService.config;
export const ssiService = SsiService.getInstance(identityConfig, logger);
export const authorizationService = new AuthorizationService();
export const userService = new UserService(ssiService, serverSecret, logger);
export const authenticationService = new AuthenticationService(userService, ssiService, { jwtExpiration, serverSecret });

export const channelInfoService = new ChannelInfoService(userService);
export const streamsService = new StreamsService(streamsConfig, logger);
export const subscriptionService = new SubscriptionService(streamsService, channelInfoService, streamsConfig);
export const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, streamsConfig, logger);

export const verificationService = new VerificationService(ssiService, userService, logger, configService);
