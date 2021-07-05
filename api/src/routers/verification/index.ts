import { Router } from 'express';
import { CONFIG } from '../../config';
import { KEY_COLLECTION_SIZE } from '../../config/identity';
import {
	RevokeVerificationBodySchema,
	TrustedRootBodySchema,
	VerifiableCredentialBodySchema,
	VerifyIdentityBodySchema
} from '../../models/schemas/request-body/verification-bodies';
import { VerificationRoutes } from '../../routes/verification';
import { VerificationService } from '../../services/verification-service';
import { Logger } from '../../utils/logger';
import { apiKeyMiddleware, authMiddleWare, authorizationService, ssiService, validate } from '../helper';
import { userService } from '../identity';

const { serverSecret, serverIdentityId } = CONFIG;
const verificationService = new VerificationService(
	ssiService,
	userService,
	{
		serverIdentityId,
		serverSecret,
		keyCollectionSize: KEY_COLLECTION_SIZE
	},
	Logger.getInstance()
);
const verificationRoutes = new VerificationRoutes(verificationService, authorizationService, CONFIG, Logger.getInstance());
const {
	createVerifiableCredential,
	checkVerifiableCredential,
	revokeVerifiableCredential,
	getLatestDocument,
	getTrustedRootIdentities,
	addTrustedRootIdentity,
	removeTrustedRootIdentity
} = verificationRoutes;

export const verificationRouter = Router();

/**
 * @openapi
 * /verification/latest-document/{identityId}:
 *   get:
 *     summary: Get the latest version of an identity document (DID)
 *     description: Get the latest version of an identity document (DID) from the IOTA Tangle.
 *     tags:
 *     - verification
 *     parameters:
 *     - name: identityId
 *       in: path
 *       required: true
 *     responses:
 *       200:
 *         description: Latest Identity document (DID)
 *         content:
 *           application/json:
 *             schema:         
 *               $ref: "#/components/schemas/LatestIdentityJsonSchema"
 *       401:
 *         description: No valid api key provided
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.get('/latest-document/:identityId', apiKeyMiddleware, getLatestDocument);

/**
 * @openapi
 * /verification/trusted-roots:
 *   post:
 *     summary: Adds Trusted Root identity identifiers (DIDs)
 *     description: Adds Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.
 *     tags:
 *     - verification
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/TrustedRootBodySchema"
 *     responses:
 *       200:
 *         description: Successful added trusted Root identity identifier.
 *       401:
 *         description: No valid api key provided / Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.post('/trusted-roots', apiKeyMiddleware, authMiddleWare, validate({ body: TrustedRootBodySchema }), addTrustedRootIdentity);

/**
 * @openapi
 * /verification/trusted-roots:
 *   get:
 *     summary: Returns a list of Trusted Root identity identifiers (DIDs)
 *     description: Returns a list of Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.
 *     tags:
 *     - verification
 *     responses:
 *       200:
 *         description: List of Trusted Root identity identifiers (DIDs).
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 trustedRoots:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: No valid api key provided
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.get('/trusted-roots', apiKeyMiddleware, getTrustedRootIdentities);

/**
 * @openapi
 * /verification/trusted-roots:
 *   delete:
 *     summary: Remove Trusted Root identity identifiers (DIDs)
 *     description: Remove Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.
 *     tags:
 *     - verification
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/TrustedRootBodySchema"
 *     responses:
 *       200:
 *         description: Successful removed trusted Root identity identifier.
 *       401:
 *         description: No valid api key provided / Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.delete('/trusted-roots', apiKeyMiddleware, authMiddleWare, validate({ body: TrustedRootBodySchema }), removeTrustedRootIdentity);

/**
 * @openapi
 * /verification/create-credential:
 *   post:
 *     summary: Verify the authenticity of an identity and issue a credential
 *     description: Verify the authenticity of an identity (of an individual, organization or object) and issue a credential stating the identity verification status. Only previously verified identities (based on a network of trust) with assigned privileges can verify other identities. Having a verified identity provides the opportunity for other identities to identify and verify a the entity they interact to.
 *     tags:
 *     - verification
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/VerifyIdentityBodySchema"
 *     responses:
 *       200:
 *         description: The created credential.
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: "#/components/schemas/VerifiableCredentialSchema"
 *       401:
 *         description: No valid api key provided / Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.post(
	'/create-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: VerifyIdentityBodySchema }),
	createVerifiableCredential
);

/**
 * @openapi
 * /verification/check-credential:
 *   post:
 *     summary: Check the verifiable credential of an identity
 *     description: Check the verifiable credential of an identity. Validates the signed verifiable credential against the Issuer information stored onto the IOTA Tangle and checks if the issuer identity (DID) contained in the credential is from a trusted root.
 *     tags:
 *     - verification
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/VerifiableCredentialSchema"
 *     responses:
 *       200:
 *         description: The registered entity.
 *         content:
 *           application/json:
 *             schema: 
 *               type: object
 *               properties:
 *                 isVerified:
 *                   type: boolean 
 *       401:
 *         description: No valid api key provided
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.post('/check-credential', apiKeyMiddleware, validate({ body: VerifiableCredentialBodySchema }), checkVerifiableCredential);

/**
 * @openapi
 * /verification/revoke-credential:
 *   post:
 *     summary: Revoke one specific verifiable credential of an identity
 *     description: Revoke one specific verifiable credential of an identity. In the case of individual and organization identities the reason could be that the user has left the organization. Only organization admins (with verified identities) or the identity owner itself can do that.
 *     tags:
 *     - verification
 *     requestBody:
 *       content: 
 *         application/json:
 *           schema: 
 *             $ref: "#/components/schemas/RevokeVerificationBodySchema"
 *     responses:
 *       200:
 *         description: Revoke successful
 *       401:
 *         description: No valid api key provided / Not authenticated
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string  
 *       5XX:
 *         description: Unexpected error
 *         content:
 *           application/json:
 *             schema:         
 *               type: object
 *               properties:
 *                 error:  
 *                   type: string 
 */
verificationRouter.post(
	'/revoke-credential',
	apiKeyMiddleware,
	authMiddleWare,
	validate({ body: RevokeVerificationBodySchema }),
	revokeVerifiableCredential
);
