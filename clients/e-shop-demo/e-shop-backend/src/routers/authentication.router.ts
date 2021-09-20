import { Router } from 'express';
import { getJWT, getNonce } from '../routes/authentication.route';

export const authenticationRouter = Router();

authenticationRouter.get('/nonce/:identityId', getNonce);

authenticationRouter.post('/authenticate/:identityId', getJWT);
