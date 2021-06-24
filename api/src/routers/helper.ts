import { Validator } from 'express-json-validator-middleware';
import { CONFIG } from '../config';
import { hasValidApiKey } from '../middlewares/api-key';
import { isAuth } from '../middlewares/authentication';
import { AuthorizationService } from '../services/authorization-service';
import { SsiService } from '../services/ssi-service';
import { Logger } from '../utils/logger';

const { serverSecret, identityConfig, apiKey } = CONFIG;

export const validator = new Validator({ allErrors: true });
export const validate = validator.validate;
export const ssiService = SsiService.getInstance(identityConfig, Logger.getInstance());
export const authorizationService = new AuthorizationService();
export const authMiddleWare = isAuth(serverSecret);
export const apiKeyMiddleware = hasValidApiKey(apiKey);
