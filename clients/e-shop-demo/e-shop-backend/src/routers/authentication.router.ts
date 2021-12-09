import { Router } from 'express';
import { getJWT, getNonce } from '../routes/authentication.route';

export const authenticationRouter = Router();

authenticationRouter.get('/nonce/:id', getNonce);

authenticationRouter.post('/authenticate/:id', getJWT);
