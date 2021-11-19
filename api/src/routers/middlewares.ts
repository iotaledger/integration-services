import { Validator } from 'express-json-validator-middleware';
import { hasValidApiKey } from '../middlewares/api-key';
import { isAuth } from '../middlewares/authentication';
import { ConfigurationService } from '../services/configuration-service';

const { serverSecret, apiKey } = ConfigurationService.getInstance().config;

export const validator = new Validator({ allErrors: true });
export const validate = validator.validate;

export const authMiddleWare = isAuth(serverSecret);
export const apiKeyMiddleware = hasValidApiKey(apiKey);
