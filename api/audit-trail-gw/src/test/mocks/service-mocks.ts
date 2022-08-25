import { IConfigurationService } from '../../services/configuration-service';
import { ConfigMock } from './config';
import { ServerIdentityMock } from './identities';

export const ConfigurationServiceMock: IConfigurationService = {
	config: ConfigMock,
	streamsConfig: ConfigMock.streamsConfig,
	serverIdentityId: ServerIdentityMock.document.doc.id,
	getRootIdentityId: async () => {
		return ServerIdentityMock.document.doc.id;
	}
};
