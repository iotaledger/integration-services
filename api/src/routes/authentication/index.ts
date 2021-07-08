import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProveOwnershipPostBody } from '../../models/types/request-response-bodies';
import { AuthenticationService } from '../../services/authentication-service';
import { ILogger } from '../../utils/logger';

export class AuthenticationRoutes {
	constructor(private readonly authenticationService: AuthenticationService, private readonly logger: ILogger) {}

	getNonce = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const identityId = req.params && decodeParam(<string>req.params['identityId']);

			if (!identityId) {
				res.status(StatusCodes.BAD_REQUEST).send({ error: 'A identityId must be provided to the request path!' });
				return;
			}

			const nonce = await this.authenticationService.getNonce(identityId);
			res.status(StatusCodes.OK).send({ nonce });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not the create nonce'));
		}
	};

	proveOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const identityId = req.params && decodeParam(<string>req.params['identityId']);
			const body: ProveOwnershipPostBody = req.body;
			const signedNonce = body?.signedNonce;

			if (!signedNonce || !identityId) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const jwt = await this.authenticationService.authenticate(signedNonce, identityId);
			res.status(StatusCodes.OK).send({ jwt });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not prove the ownership'));
		}
	};
}
