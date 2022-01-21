import { Router } from 'express';
import { ProveOwnershipPostBodySchema } from '@iota-is/shared-modules/src/models/schemas/request-response-body/authentication-bodies';
import { AuthenticationRoutes } from '../../routes/authentication';
import { Logger } from '../../utils/logger';
import { authenticationService } from '../services';
import { apiKeyMiddleware, validate } from '../middlewares';
import { mongodbSanitizer } from '../../middlewares/mongodb-sanitizer';

const authenticationRoutes = new AuthenticationRoutes(authenticationService, Logger.getInstance());
const { getNonce, proveOwnership } = authenticationRoutes;

export const authenticationRouter = Router();
/**
 * @openapi
 * /authentication/prove-ownership/{id}:
 *   get:
 *     summary: Request a nonce which must be signed by the private key
 *     description: Request a nonce which must be signed by the private key of the client and send it to /prove-ownership/{identity-id} endpoint via POST. This allows a user to prove ownership of its identity public key.
 *     tags:
 *     - authentication
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/IdentityIdSchema'
 *       examples:
 *         id:
 *           value: did:iota:3tqQeyDeEmjjSgAWGa99qmhYgrse9mEX89QqgSwsrrWy
 *           summary: Example identity id (DID identifier)
 *     responses:
 *       200:
 *         description: Returns a nonce.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NonceSchema'
 *       401:
 *         description: No valid api key provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
authenticationRouter.get('/prove-ownership/:id', apiKeyMiddleware, getNonce);

/**
 * @openapi
 * /authentication/prove-ownership/{id}:
 *   post:
 *     summary: Get an authentication token by signing a nonce
 *     description: Get an authentication token by signing a nonce using the private key. If signature is verified, a JWT string will be returned in the response. The nonce can be received from GET /prove-ownership/{identity-id} endpoint. The JWT is used for any future API interaction.
 *     tags:
 *     - authentication
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/IdentityIdSchema'
 *       examples:
 *         id:
 *           value: did:iota:3tqQeyDeEmjjSgAWGa99qmhYgrse9mEX89QqgSwsrrWy
 *           summary: Example identity id (DID identifier)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProveOwnershipPostBodySchema'
 *           example:
 *             signedNonce: fbba5d1ae6f6d0ccb761ce42dc4b82ee767be6a7fc049002e6e2d603419a128fe752ce2e1797137ca6d324c92e2703effd5f60f71154a09ba2c7967d87a85d00
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
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       500:
 *         description: No valid signedNonce provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       401:
 *         description: No valid api key provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseSchema'
 */
authenticationRouter.post(
	'/prove-ownership/:id',
	apiKeyMiddleware,
	mongodbSanitizer,
	validate({ body: ProveOwnershipPostBodySchema }),
	proveOwnership
);
