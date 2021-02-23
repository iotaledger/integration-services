import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticationService } from '../../services/authentication-service';

export class AuthenticationRoutes {
  authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  async createIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identity = this.authenticationService.createIdentity();
      res.status(StatusCodes.CREATED).send(identity);
    } catch (error) {
      next(error);
    }
  }
}
