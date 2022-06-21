import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChannelService } from '../../services/channel-service';
import {
	AuthenticatedRequest,
	AddChannelLogBody,
	CreateChannelBody,
	ReimportBody,
	ValidateBody,
	ILogger,
	getDateFromString,
	ChannelLogRequestOptions,
	ChannelType
} from '@iota/is-shared-modules';
import { get as lodashGet, isEmpty } from 'lodash';
import { compareAsc } from 'date-fns';

export class ChannelRoutes {
	constructor(private readonly channelService: ChannelService, private readonly logger: ILogger) {}

	createChannel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const { name, description, topics, seed, hasPresharedKey, presharedKey, type } = req.body as CreateChannelBody;
			const { id } = req.user;

			if (!id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no id provided' });
			}

			const channelExists = await this.channelService.channelExists(name);
			if (channelExists) {
				return res.status(StatusCodes.CONFLICT).send({ error: 'channel already exists' });
			}

			const channel = await this.channelService.create({
				id,
				name,
				description,
				topics,
				hasPresharedKey,
				seed,
				presharedKey,
				type
			});
			return res.status(StatusCodes.CREATED).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not create the channel'));
		}
	};

	getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const { id } = req.user;

			if (!channelAddress || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}
			const startDate = <string>req.query['start-date'];
			const endDate = <string>req.query['end-date'];
			const tempStartDate = getDateFromString(startDate);
			const tempEndDate = getDateFromString(endDate);

			if (startDate && endDate && compareAsc(tempStartDate, tempEndDate) === 1) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'start date is after end date' });
			}

			const limitParam = parseInt(<string>req.query.limit, 10);
			const indexParam = parseInt(<string>req.query.index, 10);
			const limit = isNaN(limitParam) || limitParam == 0 ? undefined : limitParam;
			const index = isNaN(indexParam) ? undefined : indexParam;
			const ascending: boolean = <string>req.query.asc === 'true';
			const options: ChannelLogRequestOptions =
				limit !== undefined && index !== undefined ? { limit, index, ascending, startDate, endDate } : { ascending, startDate, endDate };

			const channel = await this.channelService.getLogs(channelAddress, id, options);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the logs'));
		}
	};

	getHistory = async (req: Request, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const presharedKey = <string>req.query?.['preshared-key'];
			const type = (<string>req.query?.['type'] || 'private') as ChannelType;

			if (!channelAddress) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress provided' });
			}

			if (!presharedKey && type === ChannelType.private) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no preshared-key provided' });
			}

			const history = await this.channelService.getHistory(channelAddress, type, presharedKey);
			return res.status(StatusCodes.OK).send(history);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not get the history'));
		}
	};

	addLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const { id } = req.user;
			const body = req.body as AddChannelLogBody;

			if (!channelAddress || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			if (isEmpty(body)) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'empty body' });
			}

			const channel = await this.channelService.addLogs(channelAddress, id, body);
			return res.status(StatusCodes.OK).send(channel);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not add the logs'));
		}
	};

	reimport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const { id } = req.user;
			const body = req.body as ReimportBody;
			const { seed, subscriptionPassword } = body;

			if (!channelAddress || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			if (!seed) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no seed provided' });
			}

			await this.channelService.reimport(channelAddress, id, seed, subscriptionPassword);
			return res.sendStatus(StatusCodes.OK);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not reimport channel data'));
		}
	};

	validateLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any>> => {
		try {
			const channelAddress = lodashGet(req, 'params.channelAddress');
			const { id } = req.user;
			const channelLogs = req.body as ValidateBody;

			if (!channelAddress || !id) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no channelAddress or id provided' });
			}

			if (!channelLogs || channelLogs.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).send({ error: 'no logs provided' });
			}

			const validateRes = await this.channelService.validate(channelAddress, id, channelLogs);
			return res.status(StatusCodes.OK).send(validateRes);
		} catch (error) {
			this.logger.error(error);
			next(new Error('could not validate the channel data'));
		}
	};
}
