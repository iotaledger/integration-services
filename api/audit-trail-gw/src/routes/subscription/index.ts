import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as _ from 'lodash';
import { SubscriptionService } from '../../services/subscription-service';
import {
	AuthenticatedRequest,
	AuthorizeSubscriptionBody,
	RequestSubscriptionBody,
	Subscription,
	SubscriptionUpdate,
	SubscriptionType,
	ChannelType,
	SubscriptionState
} from '@iota/is-shared-modules';
import { ILogger } from '@iota/is-shared-modules/node';
import { ChannelInfoService } from '../../services/channel-info-service';

export class SubscriptionRoutes {
	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly channelInfoService: ChannelInfoService,
		private readonly logger: ILogger
	) { }

	addSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const paramChannelAddress = _.get(req, 'params.channelAddress');
			const paramIdentityId = _.get(req, 'params.id');
			const subscription = req.body as Subscription;
			const { channelAddress, id, publicKey } = subscription;

			// paramChannelAddress and paramIdentityId are just used for REST completeness
			if (!paramChannelAddress || !paramIdentityId || !publicKey) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress, id or publicKey provided' });
			}

			let existingSubscription = await this.subscriptionService.getSubscription(channelAddress, id);
			if (existingSubscription) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'subscription already added' });
			}

			existingSubscription = await this.subscriptionService.getSubscriptionByPublicKey(channelAddress, publicKey);
			if (existingSubscription) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'subscription already added' });
			}

			await this.subscriptionService.addSubscription(subscription);
			return res.status(StatusCodes.CREATED).send(subscription);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not add subscription'));
		}
	};

	updateSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const subscriberId = _.get(req, 'params.id');
			const userIdentityId = req.user.id;
			const subscriptionUpdate = req.body as SubscriptionUpdate;

			if (!channelAddress || !subscriberId) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			const authorId = await this.channelInfoService.getChannelAuthor(channelAddress);

			// updating is only allowed for the subscriber and channel author
			if (userIdentityId !== subscriberId && userIdentityId !== authorId) {
				return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authorized to update the subscription' });
			}

			const subscription = await this.subscriptionService.getSubscription(channelAddress, subscriberId);

			if (!subscription) {
				return res.status(StatusCodes.NOT_FOUND).send({ error: 'no subscription found' });
			}

			await this.subscriptionService.updateSubscription(channelAddress, subscriberId, subscriptionUpdate);
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not update subscription'));
		}
	};

	deleteSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const subscriberId = _.get(req, 'params.id');
			const userIdentityId = req.user.id;

			if (!channelAddress || !subscriberId) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			const authorId = await this.channelInfoService.getChannelAuthor(channelAddress);

			// deleting is only allowed for the subscriber and channel author
			if (userIdentityId !== subscriberId && userIdentityId !== authorId) {
				return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'not authorized to delete the subscription' });
			}

			const subscription = await this.subscriptionService.getSubscription(channelAddress, subscriberId);

			if (!subscription) {
				return res.status(StatusCodes.NOT_FOUND).send({ error: 'no subscription found' });
			}

			await this.subscriptionService.deleteSubscription(channelAddress, subscriberId);
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not delete subscription'));
		}
	};

	getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			let isAuthorized = _.get(req, 'query.is-authorized');

			if (isAuthorized) {
				isAuthorized = isAuthorized === 'true';
			}

			if (!channelAddress) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress provided' });
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
			const id = _.get(req, 'params.id');
			if (!channelAddress || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			const subscriptions = await this.subscriptionService.getSubscription(channelAddress, id);
			return res.status(StatusCodes.OK).send(subscriptions);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the subscription'));
		}
	};

	requestSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const asymSharedKey = <string>req?.query['asym-shared-key'];
			const { seed, accessRights, presharedKey } = req.body as RequestSubscriptionBody;
			const subscriberId = req.user.id;

			if (!subscriberId || !channelAddress) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			const subscription = await this.subscriptionService.getSubscription(channelAddress, subscriberId);

			if (subscription) {
				return res.status(StatusCodes.BAD_REQUEST).send('subscription already requested');
			}

			const channelType = await this.channelInfoService.getChannelType(channelAddress);

			if (channelType === ChannelType.privatePlus && !asymSharedKey) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no asymmetric shared key provided' });
			}

			const channel = await this.subscriptionService.requestSubscription({
				subscriberId,
				channelAddress,
				accessRights,
				channelType: channelType || ChannelType.private,
				seed,
				presharedKey,
				asymSharedKey
			});
			return res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not request the subscription'));
		}
	};

	revokeSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const authorId = req.user?.id;
			const body = req.body as AuthorizeSubscriptionBody;
			const { subscriptionLink, id } = body;

			if (!authorId || !channelAddress) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			const authorSubscription = await this.subscriptionService.getSubscription(channelAddress, authorId);

			if (!authorSubscription || authorSubscription.type !== SubscriptionType.Author) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'subscription must be an author' });
			}

			// check if subscription exists to revoke
			let subscription: Subscription;
			if (!subscriptionLink && id) {
				subscription = await this.subscriptionService.getSubscription(channelAddress, id);
			} else {
				subscription = await this.subscriptionService.getSubscriptionByLink(subscriptionLink);
			}

			if (!subscription || !subscription?.subscriptionLink || !subscription?.publicKey) {
				throw new Error('no valid subscription found!');
			}

			await this.subscriptionService.revokeSubscription(channelAddress, subscription, authorSubscription);

			return res.sendStatus(StatusCodes.OK);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not revoke the subscription'));
		}
	};

	authorizeSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const body = req.body as AuthorizeSubscriptionBody;
			const { subscriptionLink, id } = body;
			const authorId = req.user?.id;
			let subscription: Subscription = undefined;

			if (!authorId) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no id provided' });
			}

			if (!subscriptionLink && id) {
				subscription = await this.subscriptionService.getSubscription(channelAddress, id);
			} else {
				subscription = await this.subscriptionService.getSubscriptionByLink(subscriptionLink);
			}

			if (!subscription || !subscription?.subscriptionLink) {
				throw new Error('no subscription found!');
			}

			if (subscription?.isAuthorized) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'subscription already authorized' });
			}

			const isAuthor = await this.subscriptionService.isAuthor(channelAddress, authorId);
			if (!isAuthor) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'not the valid author of the channel' });
			}

			const channel = await this.subscriptionService.authorizeSubscription(channelAddress, subscription, authorId);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not authorize the subscription'));
		}
	};

	getSubscriptionState = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const id = req?.user?.id;

			if (!channelAddress || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			const state = await this.subscriptionService.getSubscriptionState(channelAddress, id);
			const buffer = Buffer.from(state);
			const stateBase64 = buffer.toString('base64');

			return res.status(StatusCodes.OK).send({ state: stateBase64 });
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the subscription state'));
		}
	};

	updateSubscriptionState = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const channelAddress = _.get(req, 'params.channelAddress');
			const id = req?.user?.id;
			const { state } = req.body as SubscriptionState;

			if (!channelAddress || !id || !state) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress, id or state provided' });
			}

			const buffer = Buffer.from(state, 'base64');
			const stateUtf8 = buffer.toString('utf-8');

			await this.subscriptionService.updateSubscriptionState(channelAddress, id, stateUtf8);
			return res.status(StatusCodes.OK).send();
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not update the subscription state'));
		}
	};
}
