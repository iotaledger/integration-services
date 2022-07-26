import { ChannelInfo, ChannelInfoPersistence, ChannelInfoSearch, ChannelType } from '@iota/is-shared-modules';
import { getDateFromString, getDateStringFromDate } from '@iota/is-shared-modules/node';
import * as ChannelInfoDb from '../database/channel-info';
import isEmpty from 'lodash/isEmpty';

export class ChannelInfoService {
	async getChannelInfo(channelAddress: string, reqId: string, isAdmin: boolean): Promise<ChannelInfo | null> {
		const channelInfoPersistence = await ChannelInfoDb.getChannelInfo(channelAddress);
		const channelInfo = this.getChannelInfoObject(channelInfoPersistence);
		const authorId = channelInfo?.authorId;
		const hidden = channelInfo?.hidden;
		const isInVisibilityList = channelInfo?.visibilityList && channelInfo.visibilityList.find((i) => i.id == reqId) != null;
		if (hidden && !isAdmin && reqId !== authorId && !isInVisibilityList) {
			return null;
		}
		if (!isAdmin && reqId !== authorId && (!hidden || isInVisibilityList)) {
			channelInfo.visibilityList = undefined;
		}
		return channelInfo;
	}

	async searchChannelInfo(channelInfoSearch: ChannelInfoSearch, reqId: string, isAdmin: boolean): Promise<ChannelInfo[]> {
		let channelInfoPersistence: ChannelInfoPersistence[] = [];
		channelInfoPersistence = await ChannelInfoDb.searchChannelInfo(channelInfoSearch);
		let channelInfos = channelInfoPersistence?.map((channel) => this.getChannelInfoObject(channel)).filter((c) => c);
		channelInfos = channelInfos
			.filter((ch) => {
				const isAuthor = reqId == ch.authorId;
				if (ch.hidden && !isAdmin && !isAuthor) {
					if (!ch.visibilityList || ch.visibilityList.length == 0 || ch.visibilityList.find((i) => i.id == reqId) == null) {
						return false;
					}
				}
				return true;
			})
			.map((ch) => {
				const isAuthor = reqId == ch.authorId;
				if (!isAdmin && !isAuthor) {
					ch.visibilityList = undefined;
				}
				return ch;
			});
		return channelInfos;
	}

	async addChannelInfo(channelInfo: ChannelInfo) {
		const channelInfoPersistence = this.getChannelInfoPersistence(channelInfo);
		return ChannelInfoDb.addChannelInfo(channelInfoPersistence);
	}

	async updateChannel(channelInfo: ChannelInfo) {
		const channelInfoPersistence = this.getChannelInfoPersistence(channelInfo);
		return ChannelInfoDb.updateChannel(channelInfoPersistence);
	}

	async addChannelRequestedSubscriptionId(channelAddress: string, channelRequestedSubscriptionId: string) {
		return ChannelInfoDb.addChannelRequestedSubscriptionId(channelAddress, channelRequestedSubscriptionId);
	}

	async removeChannelRequestedSubscriptionId(channelAddress: string, channelRequestedSubscriptionId: string) {
		return ChannelInfoDb.removeChannelRequestedSubscriptionId(channelAddress, channelRequestedSubscriptionId);
	}

	async addChannelSubscriberId(channelAddress: string, channelSubscriberId: string) {
		return ChannelInfoDb.addChannelSubscriberId(channelAddress, channelSubscriberId);
	}

	async removeChannelSubscriberId(channelAddress: string, channelSubscriberId: string) {
		return ChannelInfoDb.removeChannelSubscriberId(channelAddress, channelSubscriberId);
	}

	async deleteChannelInfo(channelAddress: string) {
		return ChannelInfoDb.deleteChannelInfo(channelAddress);
	}

	async getChannelAuthor(channelAddress: string): Promise<string | null> {
		const channelInfoPersistence = await ChannelInfoDb.getChannelInfo(channelAddress);
		const { authorId } = this.getChannelInfoObject(channelInfoPersistence);
		return authorId;
	}

	async getChannelType(channelAddress: string): Promise<ChannelType | null> {
		const channelInfoPersistence = await ChannelInfoDb.getChannelInfo(channelAddress);
		const { type } = this.getChannelInfoObject(channelInfoPersistence);
		return type;
	}

	getChannelInfoPersistence(ci: ChannelInfo): ChannelInfoPersistence | null {
		if (ci == null || isEmpty(ci.channelAddress) || isEmpty(ci.topics) || !ci.authorId) {
			throw new Error('Error when parsing the body: channelAddress, topic and author must be provided!');
		}

		const channelInfoPersistence: ChannelInfoPersistence = {
			created: ci.created ? getDateFromString(ci.created) : null,
			authorId: ci.authorId,
			type: ci.type,
			name: ci.name,
			description: ci.description,
			subscriberIds: ci.subscriberIds || [],
			requestedSubscriptionIds: ci.requestedSubscriptionIds || [],
			topics: ci.topics,
			channelAddress: ci.channelAddress,
			latestMessage: ci.latestMessage && getDateFromString(ci.created),
			hidden: ci.hidden,
			visibilityList: ci.visibilityList
		};

		return channelInfoPersistence;
	}

	getChannelInfoObject(cip: ChannelInfoPersistence): ChannelInfo | null {
		if (cip == null || isEmpty(cip.channelAddress)) {
			return null;
		}

		const channelInfo: ChannelInfo = {
			created: getDateStringFromDate(cip.created),
			authorId: cip.authorId,
			name: cip.name,
			description: cip.description,
			subscriberIds: cip.subscriberIds || [],
			requestedSubscriptionIds: cip.requestedSubscriptionIds || [],
			topics: cip.topics,
			type: cip.type,
			latestMessage: cip.latestMessage && getDateStringFromDate(cip.latestMessage),
			channelAddress: cip.channelAddress,
			hidden: cip.hidden,
			visibilityList: cip.visibilityList || []
		};
		return channelInfo;
	}
}
