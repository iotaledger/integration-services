import { Validator } from 'express-json-validator-middleware';
import { hasValidApiKey } from '../middlewares/api-key';
import { isAuth } from '../middlewares/authentication';
import { ConfigurationService } from '../services/configuration-service';
import { Logger } from '@iota-is/shared-modules/lib/utils/logger';

const { serverSecret, apiKey } = ConfigurationService.getInstance(Logger.getInstance()).config;

export const validator = new Validator({ allErrors: true });
export const validate = validator.validate;

export const authMiddleWare = isAuth(serverSecret);
export const apiKeyMiddleware = hasValidApiKey(apiKey);
