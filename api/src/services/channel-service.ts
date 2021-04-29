import { StreamsService } from './streams-service';

export class ChannelService {
	streamsService: StreamsService;

	constructor(streamsService: StreamsService) {
		this.streamsService = streamsService;
	}
	create = async (): Promise<{ seed: string; announcementLink: string }> => {
		return this.streamsService.create();
	};

	addLogs = async (address: string, publicPayload: string, maskedPayload: string): Promise<{ resLink: string; payload: string }> => {
		return this.streamsService.addLogs(address, publicPayload, maskedPayload);
	};

	getLogs = async (): Promise<{ publicData: any; maskedData: any }> => {
		return this.streamsService.getLogs();
	};
}
