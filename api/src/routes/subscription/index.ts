import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';
import { SubscriptionService } from '../../services/subscription-service';
import { AuthenticatedRequest } from '../../models/types/authentication';

export class SubscriptionRoutes {
	private readonly subscriptionService: SubscriptionService;
	constructor(subscriptionService: SubscriptionService) {
		this.subscriptionService = subscriptionService;
	}

	getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			// TODO validate
			const channel = await this.subscriptionService.getSubscriptions(req.user.userId, channelAddress);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};

	requestSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const body = req.body;
			// TODO validate
			const channel = await this.subscriptionService.requestSubscription(req.user.userId, channelAddress, body.accessRights, body.seed);
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	authorizeSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const body = req.body;
			// TODO validate
			let subscriptionLink = body.subscriptionLink;
			if (!body.subscriptionLink && body.userId) {
				const sub = await this.subscriptionService.getSubscriptions(channelAddress, body.userId);
				subscriptionLink = sub?.subscriptionLink;
			}
			if (!subscriptionLink) {
				throw new Error('no subscription link found or provided!');
			}
			const channel = await this.subscriptionService.authorizeSubscription(channelAddress, subscriptionLink);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
