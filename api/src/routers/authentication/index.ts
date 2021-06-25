import { Router } from 'express';
import { CONFIG } from '../../config';
import { ProveOwnershipPostBodySchema } from '../../models/schemas/request-body/authentication-bodies';
import { AuthenticationRoutes } from '../../routes/authentication';
import { AuthenticationService } from '../../services/authentication-service';
import { Logger } from '../../utils/logger';
import { apiKeyMiddleware, ssiService, validate } from '../helper';
import { userService } from '../identity';

const { serverSecret, jwtExpiration } = CONFIG;

export const authenticationService = new AuthenticationService(userService, ssiService, { jwtExpiration, serverSecret });
const authenticationRoutes = new AuthenticationRoutes(authenticationService, Logger.getInstance());
const { getNonce, proveOwnership } = authenticationRoutes;

export const authenticationRouter = Router();
/**
 * @openapi
 * /authentication/prove-ownership/{identityId}:
 *   get:
 *     description: Request a nonce which must be signed by the private key of the client and send it to /prove-ownership/{identity-id} endpoint via POST. This allows a user to prove ownership of its identity public key.
 *     parameters:
 *     - name: identityId
 *       in: path
 *       required: true
 *     responses:
 *       200:
 *         description: Returns a nouce.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nounce:  
 *                   type: string                
 */
authenticationRouter.get('/prove-ownership/:identityId', apiKeyMiddleware, getNonce);

/**
 * @openapi
 * /authentication/prove-ownership/{identityId}:
 *   post:
 *     description: Get an authentication token by signing a nonce using the private key. If signature is verified, a JWT string will be returned in the response. The nonce can be received from GET /prove-ownership/{identity-id} endpoint. The JWT is used for any future API interaction.
  *     parameters:
 *     - name: identityId
 *       in: path
 *       required: true
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signedNonce:
 *                 type: string
 *                 minLength: 128
 *                 maxLength: 128
 *     responses:
 *       200:
 *         description: Returns a JSON Web Token (JWT).
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwt:  
 *                   type: string
 *       400:
 *         description: No valid body provided
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string
*       500:
 *         description: No valid signedNonce provided
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string
 * 
 */
authenticationRouter.post('/prove-ownership/:identityId', apiKeyMiddleware, validate({ body: ProveOwnershipPostBodySchema }), proveOwnership);
