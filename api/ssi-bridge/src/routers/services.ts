import { AuthenticationService } from '../services/authentication-service';
import { AuthorizationService } from '../services/authorization-service';
import { SsiService } from '../services/ssi-service';
import { UserService } from '../services/user-service';
import { VerificationService } from '../services/verification-service';
import { Logger } from '../utils/logger';
import { ConfigurationService } from '../services/configuration-service';

const logger = Logger.getInstance();
const configService = ConfigurationService.getInstance(logger);
const { serverSecret, identityConfig, jwtExpiration, jwtSecret } = configService.config;

export const ssiService = SsiService.getInstance(identityConfig, logger);
export const authorizationService = new AuthorizationService();
export const userService = new UserService(ssiService, serverSecret, logger);
export const authenticationService = new AuthenticationService(userService, ssiService, { jwtExpiration, jwtSecret }, logger);

export const verificationService = new VerificationService(ssiService, userService, logger, configService);
