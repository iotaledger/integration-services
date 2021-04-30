import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { SubscriptionService } from '../../services/subscription-service';
import { AuthenticatedRequest } from '../../models/types/authentication';

export class SubscriptionRoutes {
	private readonly subscriptionService: SubscriptionService;
	constructor(subscriptionService: SubscriptionService) {
		this.subscriptionService = subscriptionService;
	}

	getSubscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.subscriptionService.getSubscriptions(body.announcementLink);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	requestSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.subscriptionService.requestSubscription(req.user.userId, body.announcementLink);
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	authorizeSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const body = req.body;
			// TODO validate
			const channel = await this.subscriptionService.authorizeSubscription(body.subscriptionLink, body.announcementLink);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
