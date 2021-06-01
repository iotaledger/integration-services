import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../../services/user-service';
import { AuthenticationService } from '../../services/authentication-service';

export class AuthenticationRoutes {
	private readonly authenticationService: AuthenticationService;
	readonly userService: UserService;

	constructor(authenticationService: AuthenticationService, userService: UserService) {
		this.authenticationService = authenticationService;
		this.userService = userService;
	}

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
			next(error);
		}
	};

	proveOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const decodeParam = (param: string): string | undefined => (param ? decodeURI(param) : undefined);
			const identityId = req.params && decodeParam(<string>req.params['identityId']);
			const body = req.body;
			const signedNonce = body?.signedNonce;

			if (!signedNonce || !identityId) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const jwt = await this.authenticationService.authenticate(signedNonce, identityId);
			res.status(StatusCodes.OK).send({ jwt });
		} catch (error) {
			next(error);
		}
	};
}
