import { AuthorizationService } from '../services/authorization-service';
import { ChannelInfoService } from '../services/channel-info-service';
import { ChannelService } from '../services/channel-service';
import { StreamsService } from '../services/streams-service';
import { SubscriptionService } from '../services/subscription-service';
import { UserService } from '../services/user-service';
import { Logger } from '@iota/is-shared-modules/lib/utils/logger';
import { ConfigurationService } from '../services/configuration-service';

const logger = Logger.getInstance();
const configService = ConfigurationService.getInstance(logger);
const { streamsConfig } = configService.config;

export const authorizationService = new AuthorizationService();
export const userService = new UserService();

export const channelInfoService = new ChannelInfoService(userService);
export const streamsService = new StreamsService(streamsConfig, logger);
export const subscriptionService = new SubscriptionService(streamsService, channelInfoService, streamsConfig);
export const channelService = new ChannelService(streamsService, channelInfoService, subscriptionService, streamsConfig, logger);
