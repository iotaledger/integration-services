import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';
import { SubscriptionService } from '../../services/subscription-service';
import { AuthenticatedRequest } from '../../models/types/verification';
import { AuthorizeSubscriptionBody, RequestSubscriptionBody } from '../../models/types/request-response-bodies';
import { ILogger } from '../../utils/logger';
import { Subscription } from '../../models/types/subscription';
import { SubscriptionType } from '../../models/schemas/subscription';

export class SubscriptionRoutes {
	constructor(private readonly subscriptionService: SubscriptionService, private readonly logger: ILogger) {}

	getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			let isAuthorized = _.get(req, 'query.is-authorized');

			if (isAuthorized) {
				isAuthorized = isAuthorized === 'true';
			}

			if (!channelAddress) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const subscriptions = await this.subscriptionService.getSubscriptions(channelAddress, isAuthorized);
			return res.status(StatusCodes.OK).send(subscriptions);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the subscriptions'));
		}
	};

	getSubscriptionByIdentity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const identityId = _.get(req, 'params.identityId');
			if (!channelAddress || !identityId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const subscriptions = await this.subscriptionService.getSubscription(channelAddress, identityId);
			return res.status(StatusCodes.OK).send(subscriptions);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the subscription'));
		}
	};

	requestSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const { seed, accessRights, presharedKey } = req.body as RequestSubscriptionBody;
			const subscriberId = req.user.identityId;

			if (!subscriberId || !channelAddress) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			const subscription = await this.subscriptionService.getSubscription(channelAddress, subscriberId);

			if (subscription) {
				return res.status(StatusCodes.BAD_REQUEST).send('subscription already requested');
			}

			const channel = await this.subscriptionService.requestSubscription({
				subscriberId,
				channelAddress,
				accessRights,
				seed,
				presharedKey
			});
			return res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not request the subscription'));
		}
	};

	authorizeSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const body = req.body as AuthorizeSubscriptionBody;
			const { subscriptionLink, identityId } = body;
			const authorId = req.user?.identityId;
			let subscription: Subscription = undefined;

			if (!authorId) {
				return res.sendStatus(StatusCodes.BAD_REQUEST);
			}

			if (!subscriptionLink && identityId) {
				subscription = await this.subscriptionService.getSubscription(channelAddress, identityId);
			} else {
				subscription = await this.subscriptionService.getSubscriptionByLink(subscriptionLink);
			}

			if (!subscription || !subscription?.subscriptionLink) {
				throw new Error('no subscription found!');
			}

			if (subscription?.isAuthorized) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'subscription already authorized' });
			}

			const author = await this.subscriptionService.getSubscription(channelAddress, authorId);
			if (author?.type !== SubscriptionType.Author) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'not the valid author of the channel' });
			}

			const channel = await this.subscriptionService.authorizeSubscription(channelAddress, subscription, author);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not authorize the subscription'));
		}
	};
}
