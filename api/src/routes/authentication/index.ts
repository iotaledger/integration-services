import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserWithoutId } from '../../models/data/user';
import { AuthenticationService } from '../../services/authentication-service';

export class AuthenticationRoutes {
  private readonly authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  createIdentity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO
      const user: UserWithoutId = undefined;
      const identity = await this.authenticationService.createIdentity(user);

      res.status(StatusCodes.CREATED).send(identity);
    } catch (error) {
      next(error);
    }
  };
}
