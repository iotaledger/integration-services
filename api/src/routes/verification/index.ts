import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { VerifiableCredentialJson } from '../../models/types/identity';
import { VerificationService } from '../../services/verification-service';
import { Config } from '../../models/config';
import { RevokeVerificationBody, VerifyIdentityBody } from '../../models/types/request-bodies';
import { AuthenticatedRequest, AuthorizationCheck, Subject } from '../../models/types/verification';
import { UserService } from '../../services/user-service';
import { User, UserRoles } from '../../models/types/user';
import * as KeyCollectionLinksDb from '../../database/verifiable-credentials';
import { AuthorizationService } from '../../services/authorization-service';
import { VerifiableCredentialPersistence } from '../../models/types/key-collection';

export class VerificationRoutes {
	constructor(
		private readonly verificationService: VerificationService,
		private readonly userService: UserService,
		private readonly authorizationService: AuthorizationService,
		private readonly config: Config
	) {
		console.log('userservice', this.userService);
	}

	createVerifiableCredential = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const verifyIdentityBody = req.body as VerifyIdentityBody;
			const { initiatorVC, subject } = verifyIdentityBody;
			const requestUser = req.user;

			/*if (!subject && subjectId) {
				subject = await this.userService.getUser(subjectId);
			}*/

			if (!subject) {
				throw new Error('no valid subject!');
			}

			if (!requestUser.identityId && !initiatorVC?.credentialSubject?.id) {
				throw new Error('no initiator id could be found!');
			}

			const { isAuthorized, error } = await this.isAuthorizedToVerify(subject, initiatorVC, requestUser);
			if (!isAuthorized) {
				throw error;
			}

			const vc: VerifiableCredentialJson = await this.verificationService.verifyIdentity(
				subject,
				this.config.serverIdentityId,
				initiatorVC?.credentialSubject?.id || requestUser.identityId
			);

			res.status(StatusCodes.OK).send(vc);
		} catch (error) {
			next(error);
		}
	};

	checkVerifiableCredential = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const vcBody = req.body as VerifiableCredentialJson;
			const isVerified = await this.verificationService.checkVerifiableCredential(vcBody);
			res.status(StatusCodes.OK).send({ isVerified });
		} catch (error) {
			next(error);
		}
	};

	revokeVerifiableCredential = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const revokeBody = req.body as RevokeVerificationBody;
			const requestUser = req.user;

			const vcp = await KeyCollectionLinksDb.getVerifiableCredential(revokeBody.signatureValue);
			if (!vcp) {
				throw new Error('no vc found to revoke the verification!');
			}
			const { isAuthorized, error } = await this.isAuthorizedToRevoke(vcp, requestUser);
			if (!isAuthorized) {
				throw error;
			}

			await this.verificationService.revokeVerifiableCredential(vcp, this.config.serverIdentityId);

			res.sendStatus(StatusCodes.OK);
		} catch (error) {
			next(error);
		}
	};

	getLatestDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const did = req.params && decodeParam(<string>req.params['identityId']);

			if (!did) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const doc = await this.verificationService.getLatestDocument(did);

			res.status(StatusCodes.OK).send(doc);
		} catch (error) {
			next(error);
		}
	};

	getTrustedRootIdentities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const trustedRoots = await this.verificationService.getTrustedRootIds();
			res.status(StatusCodes.OK).send({ trustedRoots });
		} catch (error) {
			next(error);
		}
	};

	isAuthorizedToRevoke = async (kci: VerifiableCredentialPersistence, requestUser: User): Promise<AuthorizationCheck> => {
		const isAuthorizedUser = this.authorizationService.isAuthorizedUser(requestUser.identityId, kci.vc.id);
		const isAuthorizedInitiator = this.authorizationService.isAuthorizedUser(requestUser.identityId, kci.initiatorId);
		if (!isAuthorizedUser && !isAuthorizedInitiator) {
			const isAuthorizedAdmin = await this.authorizationService.isAuthorizedAdmin(requestUser, kci.vc.id);
			if (!isAuthorizedAdmin) {
				return { isAuthorized: false, error: new Error('not allowed to revoke credential!') };
			}
		}

		return { isAuthorized: true, error: null };
	};

	isAuthorizedToVerify = async (subject: Subject, initiatorVC: VerifiableCredentialJson, requestUser: User): Promise<AuthorizationCheck> => {
		const isAdmin = requestUser.role === UserRoles.Admin;
		if (!isAdmin) {
			if (!initiatorVC || !initiatorVC.credentialSubject) {
				return { isAuthorized: false, error: new Error('no valid verfiable credential!') };
			}

			if (requestUser.identityId !== initiatorVC.credentialSubject.id || requestUser.identityId !== initiatorVC.id) {
				return { isAuthorized: false, error: new Error('user id of request does not concur with the initiatorVC user id!') };
			}

			if (!this.authorizationService.hasAuthorizedUserType(initiatorVC.credentialSubject.type)) {
				return { isAuthorized: false, error: new Error('initiator is not allowed based on its identity type!') };
			}

			if (!this.authorizationService.hasVerificationCredentialType(initiatorVC.type)) {
				return { isAuthorized: false, error: new Error('initiator is not allowed based on its credential type!') };
			}

			/*if (
				(initiatorVC.credentialSubject.organization || subject.organization) &&
				subject.organization !== initiatorVC.credentialSubject.organization
			) {
				return { isAuthorized: false, error: new Error('user must be in same organization!') };
			}*/

			const isInitiatorVerified = await this.verificationService.checkVerifiableCredential(initiatorVC);
			if (!isInitiatorVerified) {
				return { isAuthorized: false, error: new Error('initiatorVC is not verified!') };
			}
		}
		return { isAuthorized: true, error: null };
	};
}
