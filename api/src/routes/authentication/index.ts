import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProveOwnershipPostBody } from '../../models/types/request-response-bodies';
import { AuthenticationService } from '../../services/authentication-service';
import { ILogger } from '../../utils/logger';

export class AuthenticationRoutes {
	constructor(private readonly authenticationService: AuthenticationService, private readonly logger: ILogger) {}

	getNonce = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const identityId = req.params && decodeParam(<string>req.params['identityId']);

			if (!identityId) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no identityId provided' });
			}

			const nonce = await this.authenticationService.getNonce(identityId);
			res.status(StatusCodes.OK).send({ nonce });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not the create nonce'));
		}
	};

	proveOwnership = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const identityId = req.params && decodeParam(<string>req.params['identityId']);
			const body: ProveOwnershipPostBody = req.body;
			const signedNonce = body?.signedNonce;

			if (!signedNonce || !identityId) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no signedNonce or identityId provided' });
			}

			const jwt = await this.authenticationService.authenticate(signedNonce, identityId);
			return res.status(StatusCodes.OK).send({ jwt });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not prove the ownership'));
		}
	};
}
