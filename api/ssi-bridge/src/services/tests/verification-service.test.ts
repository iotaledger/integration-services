import { VerificationService } from '../verification-service';
import * as KeyCollectionDb from '../../database/revocation-bitmap';
import * as IdentityDocsDb from '../../database/identity-keys';
import { UserService } from '../user-service';
import { SsiService } from '../ssi-service';
import { LoggerMock } from '../../test/mocks/logger';
import { ConfigurationServiceMock } from '../../test/mocks/service-mocks';

describe('test getKeyCollection', () => {
	let ssiService: SsiService, userService: UserService, verificationService: VerificationService;
	const keyCollectionIndex = 0;
	const serverSecret = ConfigurationServiceMock.config.serverSecret;
	const expectedKeyCollection = {
		index: keyCollectionIndex,
		keys: [{ public: 'public-key', secret: 'secret-key' }],
		type: ''
	};

	beforeEach(() => {
		ssiService = SsiService.getInstance({} as any, LoggerMock);
		userService = new UserService(ssiService, serverSecret, LoggerMock);
		verificationService = new VerificationService(ssiService, userService, LoggerMock, ConfigurationServiceMock);
	});

	it('should generate a new keycollection since index not found', async () => {
		const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve({} as any));
		const createRevocationBitmapSpy = jest.spyOn(ssiService, 'createRevocationBitmap').mockReturnValue(
			Promise.resolve({
				keyCollectionJson: {
					index: keyCollectionIndex,
					type: '',
					keys: [{ public: 'public-key', secret: 'secret-key' }]
				},
				docUpdate: {}
			} as any)
		);
		const getKeyCollectionSpy = jest.spyOn(KeyCollectionDb, 'getKeyCollection').mockReturnValue(Promise.resolve(null)); // no keycollection found
		const saveKeyCollectionSpy = jest
			.spyOn(KeyCollectionDb, 'saveKeyCollection')
			.mockReturnValue(Promise.resolve({ result: { n: 1 } } as any));

		const keyCollection = await verificationService.getKeyCollection(keyCollectionIndex);

		expect(getKeyCollectionSpy).toHaveBeenCalledWith(
			keyCollectionIndex,
			ConfigurationServiceMock.serverIdentityId,
			ConfigurationServiceMock.config.serverSecret
		);
		expect(createRevocationBitmapSpy).toHaveBeenCalledWith(keyCollectionIndex, 0, {});
		expect(saveKeyCollectionSpy).toHaveBeenCalledWith(expectedKeyCollection, ConfigurationServiceMock.serverIdentityId, serverSecret);
		expect(getIdentitySpy).toHaveBeenCalled();
		expect(keyCollection).toEqual(expectedKeyCollection);
	});

	it('should not generate a new keycollection since index is found', async () => {
		const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockImplementation(async () => {
			return {} as any;
		});
		const createRevocationBitmapSpy = jest.spyOn(ssiService, 'createRevocationBitmap').mockImplementation(async () => null);
		const saveKeyCollectionSpy = jest.spyOn(KeyCollectionDb, 'saveKeyCollection').mockImplementation(async () => null);

		const keyCollection = await verificationService.getKeyCollection(keyCollectionIndex);

		expect(createRevocationBitmapSpy).not.toHaveBeenCalled();
		expect(saveKeyCollectionSpy).not.toHaveBeenCalled();
		expect(getIdentitySpy).not.toHaveBeenCalled();
		expect(keyCollection).toEqual({ ...expectedKeyCollection, publicKeyBase58: 'testpublickeybase' });
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
