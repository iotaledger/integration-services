import { ChannelInfo, ChannelInfoPersistence, ChannelInfoSearch, getDateFromString, getDateStringFromDate } from '@iota/is-shared-modules';
import * as ChannelInfoDb from '../database/channel-info';
import isEmpty from 'lodash/isEmpty';

export class ChannelInfoService {
	async getChannelInfo(channelAddress: string): Promise<ChannelInfo | null> {
		const channelInfoPersistence = await ChannelInfoDb.getChannelInfo(channelAddress);
		return channelInfoPersistence && this.getChannelInfoObject(channelInfoPersistence);
	}

	async searchChannelInfo(channelInfoSearch: ChannelInfoSearch): Promise<ChannelInfo[]> {
		let channelInfoPersistence: ChannelInfoPersistence[] = [];
		channelInfoPersistence = await ChannelInfoDb.searchChannelInfo(channelInfoSearch);
		return channelInfoPersistence?.map((channel) => this.getChannelInfoObject(channel)).filter((c) => c);
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

	async removeChannelRequestedSubscriptionId(channelAddress: string, channelRequestedSubscriptionId: string){
		return ChannelInfoDb.removeChannelRequestedSubscriptionId(channelAddress,  channelRequestedSubscriptionId);
	}

	async addChannelSubscriberId(channelAddress: string, channelSubscriberId: string){
		return ChannelInfoDb.addChannelSubscriberId(channelAddress, channelSubscriberId);
	}

	async removeChannelSubscriberId(channelAddress: string, channelSubscriberId: string) {
		return ChannelInfoDb.removeChannelSubscriberId(channelAddress, channelSubscriberId);
	}

	async deleteChannelInfo(channelAddress: string) {
		return ChannelInfoDb.deleteChannelInfo(channelAddress);
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
			visibilityList: cip.visibilityList
		};
		return channelInfo;
	}
}
