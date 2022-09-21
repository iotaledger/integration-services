import { UserService } from '../user-service';
import { SsiService } from '../ssi-service';
import { LoggerMock } from '../../test/mocks/logger';
import { ConfigurationServiceMock } from '../../test/mocks/service-mocks';
import { KeyTypes } from '@iota/is-shared-modules';

describe('test user-service', () => {
	let ssiService: SsiService, userService: UserService;
	const serverSecret = ConfigurationServiceMock.config.serverSecret;

	beforeEach(() => {
		ssiService = SsiService.getInstance({} as any, LoggerMock);
		userService = new UserService(ssiService, serverSecret, LoggerMock);
	});

	it('should not generate a new bitmap since index is found', async () => {
		const type = KeyTypes.x25519;
		const keyPair = userService.getKeyPair(type);

		expect(keyPair.type).toEqual(KeyTypes.x25519);
		expect(keyPair.public.length).toEqual(44);
		expect(keyPair.private.length).toEqual(44);
		expect(keyPair.encoding).toEqual('base58');
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
