import { Router } from 'express';
import { CONFIG } from '../../config';
import { ProveOwnershipPostBodySchema } from '../../models/schemas/request-body/authentication-bodies';
import { AuthenticationRoutes } from '../../routes/authentication';
import { AuthenticationService } from '../../services/authentication-service';
import { apiKeyMiddleware, ssiService, validate } from '../helper';
import { userService } from '../identity';

const { serverSecret, jwtExpiration } = CONFIG;

export const authenticationService = new AuthenticationService(userService, ssiService, { jwtExpiration, serverSecret });
const authenticationRoutes = new AuthenticationRoutes(authenticationService);
const { getNonce, proveOwnership } = authenticationRoutes;

export const authenticationRouter = Router();
authenticationRouter.get('/prove-ownership/:identityId', apiKeyMiddleware, getNonce);
authenticationRouter.post('/prove-ownership/:identityId', apiKeyMiddleware, validate({ body: ProveOwnershipPostBodySchema }), proveOwnership);
