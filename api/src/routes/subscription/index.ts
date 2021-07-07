import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';
import { SubscriptionService } from '../../services/subscription-service';
import { AuthenticatedRequest } from '../../models/types/verification';
import { AuthorizeSubscriptionBody, RequestSubscriptionBody } from '../../models/types/request-response-bodies';
import { ILogger } from '../../utils/logger';

export class SubscriptionRoutes {
	constructor(private readonly subscriptionService: SubscriptionService, private readonly logger: ILogger) {}

	getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { identityId } = req.body; // TODO#26 don't use body use query param!

			// TODO#26 also provide possibility to get all subscriptions
			const subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
			res.status(StatusCodes.OK).send(subscription);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the subscription'));
		}
	};

	requestSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { seed, accessRights } = req.body as RequestSubscriptionBody;
			// TODO#25 validate
			const channel = await this.subscriptionService.requestSubscription(req.user.identityId, channelAddress, accessRights, seed);
			res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not request the subscription'));
		}
	};

	authorizeSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const body = req.body as AuthorizeSubscriptionBody;
			let { subscriptionLink } = body;
			const { identityId } = body;
			const authorId = req.user.identityId;
			if (!subscriptionLink && identityId) {
				const sub = await this.subscriptionService.getSubscription(channelAddress, identityId);
				subscriptionLink = sub?.subscriptionLink;
			}
			if (!subscriptionLink) {
				throw new Error('no subscription link found or provided!');
			}
			const channel = await this.subscriptionService.authorizeSubscription(channelAddress, subscriptionLink, authorId);
			res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not authorize the subscription'));
		}
	};
}
