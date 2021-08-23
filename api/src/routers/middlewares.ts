import { Validator } from 'express-json-validator-middleware';
import { CONFIG } from '../config';
import { hasValidApiKey } from '../middlewares/api-key';
import { isAuth } from '../middlewares/authentication';

const { serverSecret, apiKey } = CONFIG;

export const validator = new Validator({ allErrors: true });
export const validate = validator.validate;

export const authMiddleWare = isAuth(serverSecret);
export const apiKeyMiddleware = hasValidApiKey(apiKey);
