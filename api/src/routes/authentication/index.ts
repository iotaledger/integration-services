import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateIdentityBody, VerifiableCredentialJson } from '../../models/types/identity';
import { AuthenticationService } from '../../services/authentication-service';
import { Config } from '../../models/config';
import { AuthenticatedRequest, AuthorizationCheck, RevokeVerificationBody, VerifyUserBody } from '../../models/types/authentication';
import { UserService } from '../../services/user-service';
import { User, UserRoles } from '../../models/types/user';
import * as KeyCollectionLinksDb from '../../database/verifiable-credentials';
import { AuthorizationService } from '../../services/authorization-service';
import { VerifiableCredentialPersistence } from '../../models/types/key-collection';

export class AuthenticationRoutes {
	private readonly authenticationService: AuthenticationService;
	readonly authorizationService: AuthorizationService;
	readonly userService: UserService;
	private readonly config: Config;

	constructor(authenticationService: AuthenticationService, userService: UserService, authorizationService: AuthorizationService, config: Config) {
		this.authenticationService = authenticationService;
		this.authorizationService = authorizationService;
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
			const requestUser = req.user;
			const subject = await this.userService.getUser(subjectId);
			if (!subject) {
				throw new Error('subject does not exist!');
			}

			const { isAuthorized, error } = await this.isAuthorizedToVerify(subject, initiatorVC, requestUser);
			if (!isAuthorized) {
				throw error;
			}

			const vc: VerifiableCredentialJson = await this.authenticationService.verifyUser(
				subject,
				this.config.serverIdentityId,
				initiatorVC.credentialSubject.id
			);

			res.status(StatusCodes.OK).send(vc);
		} catch (error) {
			next(error);
		}
	};

	checkVerifiableCredential = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const vcBody: any = req.body;
			if (!vcBody?.id) {
				throw new Error('No valid verifiable credential provided!');
			}
			const vc = await this.authenticationService.checkVerifiableCredential(vcBody);

			res.status(StatusCodes.OK).send(vc);
		} catch (error) {
			next(error);
		}
	};

	revokeVerifiableCredential = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const revokeBody: RevokeVerificationBody = req.body;
			const requestUser = req.user;
			if (!revokeBody.subjectId) {
				throw new Error('No valid body provided!');
			}
			const vcp = await KeyCollectionLinksDb.getVerifiableCredential(revokeBody.subjectId, revokeBody.signatureValue);
			if (!vcp) {
				throw new Error('no vc found to revoke the verification!');
			}
			const { isAuthorized, error } = await this.isAuthorizedToRevoke(vcp, requestUser);
			if (!isAuthorized) {
				throw error;
			}

			await this.authenticationService.revokeVerifiableCredential(vcp, this.config.serverIdentityId);

			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			next(error);
		}
	};

	getLatestDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const did = req.params && decodeParam(<string>req.params['userId']);

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
			const trustedRoots = await this.authenticationService.getTrustedRootIds();
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

	isAuthorizedToRevoke = async (kci: VerifiableCredentialPersistence, requestUser: User): Promise<AuthorizationCheck> => {
		const isAuthorizedUser = this.authorizationService.isAuthorizedUser(requestUser.userId, kci.linkedIdentity);
		const isAuthorizedInitiator = this.authorizationService.isAuthorizedUser(requestUser.userId, kci.initiatorId);
		if (!isAuthorizedUser && !isAuthorizedInitiator) {
			const isAuthorizedAdmin = await this.authorizationService.isAuthorizedAdmin(requestUser, kci.linkedIdentity);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: new Error('not allowed to revoke credential!') };
			}
		}

		return { isAuthorized: true, error: null };
	};

	isAuthorizedToVerify = async (subject: User, initiatorVC: VerifiableCredentialJson, requestUser: User): Promise<AuthorizationCheck> => {
		const isAdmin = requestUser.role === UserRoles.Admin;
		if (!isAdmin || !this.authorizationService.isUserOrApi(requestUser.classification)) {
			if (!initiatorVC.credentialSubject) {
				return { isAuthorized: false, error: new Error('no valid verfiable credential!') };
			}

			if (requestUser.userId !== initiatorVC.credentialSubject.id || requestUser.userId !== initiatorVC.id) {
				return { isAuthorized: false, error: new Error('user id of request does not concur with the initiatorVC user id!') };
			}

			if (
				!this.authorizationService.isUserOrApi(initiatorVC.credentialSubject.classification) ||
				!this.authorizationService.isUserOrApi(requestUser.classification)
			) {
				return { isAuthorized: false, error: new Error('initiator is a device!') };
			}

			if (
				(initiatorVC.credentialSubject.organization || subject.organization) &&
				subject.organization !== initiatorVC.credentialSubject.organization
			) {
				return { isAuthorized: false, error: new Error('user must be in same organization!') };
			}
		}

		const isInitiatorVerified = await this.authenticationService.checkVerifiableCredential(initiatorVC);
		if (!isInitiatorVerified) {
			return { isAuthorized: false, error: new Error('initiator has to be verified!') };
		}

		return { isAuthorized: true, error: null };
	};
}
