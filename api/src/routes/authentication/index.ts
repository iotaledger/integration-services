import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateIdentityBody, VerifiableCredentialJson, VerifyUserBody } from '../../models/data/identity';
import { AuthenticationService } from '../../services/authentication-service';
import { Config } from '../../models/config';
import { AuthenticatedRequest, AuthorizationCheck } from '../../models/data/authentication';
import { UserService } from '../../services/user-service';
import { User, UserClassification } from '../../models/data/user';

export class AuthenticationRoutes {
	private readonly authenticationService: AuthenticationService;
	private readonly userService: UserService;
	private readonly config: Config;

	constructor(authenticationService: AuthenticationService, userService: UserService, config: Config) {
		this.authenticationService = authenticationService;
		this.userService = userService;
		this.config = config;
	}

	createIdentity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const createIdentityBody: CreateIdentityBody = req.body;
			const identity = await this.authenticationService.createIdentity(createIdentityBody);

			res.status(StatusCodes.CREATED).send(identity);
		} catch (error) {
			next(error);
		}
	};

	verifyUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const verifyUserBody: VerifyUserBody = req.body;
			const { initiatorVC, subjectId } = verifyUserBody;
			const initiator = await this.userService.getUser(initiatorVC.id);

			// TODO uncomment and make it private!
			/*const { isAuthorized, error } = await this.isAuthorizedToVerify(req.userId, initiatorVC, initiator);
			if (!isAuthorized) {
				throw error;
			}*/

			const vc: VerifiableCredentialJson = await this.authenticationService.verifyUser(
				subjectId,
				this.config.serverIdentityId,
				initiator.organization
			);

			res.status(StatusCodes.CREATED).send(vc);
		} catch (error) {
			next(error);
		}
	};

	checkVerifiableCredential = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const vcBody: any = req.body;
			if (!vcBody?.id) {
				throw new Error('No valid verifiable credential provided!');
			}
			const vc = await this.authenticationService.checkVerifiableCredential(vcBody, this.config.serverIdentityId);

			res.status(StatusCodes.OK).send(vc);
		} catch (error) {
			next(error);
		}
	};

	revokeVerifiableCredential = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const revokeBody: any = req.body;
			if (!revokeBody.id) {
				throw new Error('No valid body provided!');
			}
			await this.authenticationService.revokeVerifiableCredential(revokeBody.id, this.config.serverIdentityId);

			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			next(error);
		}
	};

	getLatestDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const did = decodeParam(<string>req.query?.id);

			if (!did) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const doc = await this.authenticationService.getLatestDocument(did);

			res.status(StatusCodes.OK).send(doc);
		} catch (error) {
			next(error);
		}
	};

	getTrustedRootIdentities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const trustedRoots = await this.authenticationService.getTrustedRootIdentities();
			res.status(StatusCodes.OK).send({ trustedRoots });
		} catch (error) {
			next(error);
		}
	};

	getChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const userId = req.params && decodeParam(<string>req.params['userId']);

			if (!userId) {
				res.status(StatusCodes.BAD_REQUEST).send({ error: 'A userId must be provided to the request path!' });
				return;
			}

			const challenge = await this.authenticationService.getChallenge(userId);
			res.status(StatusCodes.OK).send({ challenge });
		} catch (error) {
			next(error);
		}
	};

	auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const userId = req.params && decodeParam(<string>req.params['userId']);
			const body = req.body;
			const signedChallenge = body?.signedChallenge;

			if (!signedChallenge || !userId) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const jwt = await this.authenticationService.authenticate(signedChallenge, userId);
			res.status(StatusCodes.OK).send({ jwt });
		} catch (error) {
			next(error);
		}
	};

	isAuthorizedToVerify = async (reqUserId: string, initiatorVC: VerifiableCredentialJson, initiator: User): Promise<AuthorizationCheck> => {
		if (reqUserId !== initiatorVC.credentialSubject.id || reqUserId !== initiatorVC.id) {
			return { isAuthorized: false, error: new Error('user id of request does not concur with the initiatorVC user id!') };
		}

		if (!initiator || initiator.classification === UserClassification.device) {
			return { isAuthorized: false, error: new Error('initiator does not exist or is a device!') };
		}

		const isInitiatorVerified = await this.authenticationService.checkVerifiableCredential(initiatorVC, initiatorVC.issuer);
		if (!isInitiatorVerified) {
			return { isAuthorized: false, error: new Error('initiator has to be verified.') };
		}
		return { isAuthorized: true, error: null };
	};
}
