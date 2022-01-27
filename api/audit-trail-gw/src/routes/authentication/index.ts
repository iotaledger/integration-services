import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProveOwnershipPostBody } from '@iota-is/shared-modules/lib/types/request-response-bodies';
import { AuthenticationService } from '../../services/authentication-service';
import { ILogger } from '../../utils/logger';

export class AuthenticationRoutes {
	constructor(private readonly authenticationService: AuthenticationService, private readonly logger: ILogger) {}

	getNonce = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const id = req.params && decodeParam(<string>req.params['id']);

			if (!id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no id provided' });
			}

			const nonce = await this.authenticationService.getNonce(id);
			res.status(StatusCodes.OK).send({ nonce });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not the create nonce'));
		}
	};

	proveOwnership = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const id = req.params && decodeParam(<string>req.params['id']);
			const body: ProveOwnershipPostBody = req.body;
			const signedNonce = body?.signedNonce;

			if (!signedNonce || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no signedNonce or id provided' });
			}

			const jwt = await this.authenticationService.authenticate(signedNonce, id);
			return res.status(StatusCodes.OK).send({ jwt });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not prove the ownership'));
		}
	};
}
