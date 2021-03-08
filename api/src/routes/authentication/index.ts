import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateIdentityBody, UserCredential } from '../../models/data/identity';
import { AuthenticationService } from '../../services/authentication-service';

export class AuthenticationRoutes {
  private readonly authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }

  createIdentity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createIdentityBody: CreateIdentityBody = req.body;
      if (!createIdentityBody.username) {
        throw new Error('No valid body provided!');
      }
      const identity = await this.authenticationService.createIdentity(createIdentityBody);

      res.status(StatusCodes.CREATED).send(identity);
    } catch (error) {
      next(error);
    }
  };

  createVerifiableCredential = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userCredential: UserCredential = req.body;
      if (!userCredential.id) {
        throw new Error('No valid body provided!');
      }
      const vc: any = await this.authenticationService.createVerifiableCredential(userCredential);

      res.status(StatusCodes.CREATED).send(vc);
    } catch (error) {
      next(error);
    }
  };

  checkVerifiableCredential = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vcBody: any = req.body;
      const vc: any = await this.authenticationService.checkVerifiableCredential(vcBody);
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
      await this.authenticationService.revokeVerifiableCredential(revokeBody.id);

      res.sendStatus(StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  };
}
