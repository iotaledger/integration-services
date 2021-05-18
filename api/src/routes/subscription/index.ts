import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';
import { SubscriptionService } from '../../services/subscription-service';
import { AuthenticatedRequest } from '../../models/types/authentication';
import { AuthorizeSubscriptionBody, RequestSubscriptionBody } from '../../models/types/request-bodies';

export class SubscriptionRoutes {
	private readonly subscriptionService: SubscriptionService;
	constructor(subscriptionService: SubscriptionService) {
		this.subscriptionService = subscriptionService;
	}

	getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { userId } = req.body; // TODO don't use body use query param!

			// TODO also provide possibility to get all subscriptions
			const subscription = await this.subscriptionService.getSubscription(channelAddress, userId);
			res.status(StatusCodes.OK).send(subscription);
		} catch (error) {
			next(error);
		}
	};

	requestSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { seed, accessRights } = req.body as RequestSubscriptionBody;
			// TODO validate
			const channel = await this.subscriptionService.requestSubscription(req.user.userId, channelAddress, accessRights, seed);
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			next(error);
		}
	};

	authorizeSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const body = req.body as AuthorizeSubscriptionBody;
			let { subscriptionLink } = body;
			const { userId } = body;
			const authorId = req.user.userId;
			if (!subscriptionLink && userId) {
				const sub = await this.subscriptionService.getSubscription(channelAddress, userId);
				subscriptionLink = sub?.subscriptionLink;
			}
			if (!subscriptionLink) {
				throw new Error('no subscription link found or provided!');
			}
			const channel = await this.subscriptionService.authorizeSubscription(channelAddress, subscriptionLink, authorId);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			next(error);
		}
	};
}
