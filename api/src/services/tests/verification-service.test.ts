import { VerificationService } from '../verification-service';
import * as KeyCollectionDb from '../../database/key-collection';
import * as IdentityDocsDb from '../../database/identity-docs';
import { UserService } from '../user-service';
import { SsiService } from '../ssi-service';
import { LoggerMock } from '../../test/mocks/logger';
import { ConfigurationServiceMock } from '../../test/mocks/service-mocks';

describe('test getKeyCollection', () => {
	let ssiService: SsiService, userService: UserService, verificationService: VerificationService;
	const keyCollectionIndex = 0;
	const keyCollectionSize = ConfigurationServiceMock.identityConfig.keyCollectionSize;
	const serverSecret = ConfigurationServiceMock.config.serverSecret;
	const expectedKeyCollection = {
		count: keyCollectionSize,
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
		const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityDoc').mockReturnValue(Promise.resolve({} as any));
		const updateIdentityDocSpy = jest.spyOn(IdentityDocsDb, 'updateIdentityDoc').mockImplementation(async () => null);
		const generateKeyCollectionSpy = jest.spyOn(ssiService, 'generateKeyCollection').mockReturnValue(
			Promise.resolve({
				keyCollectionJson: {
					index: keyCollectionIndex,
					count: keyCollectionSize,
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
		expect(generateKeyCollectionSpy).toHaveBeenCalledWith(keyCollectionIndex, keyCollectionSize, {});
		expect(saveKeyCollectionSpy).toHaveBeenCalledWith(expectedKeyCollection, ConfigurationServiceMock.serverIdentityId, serverSecret);
		expect(getIdentitySpy).toHaveBeenCalled();
		expect(updateIdentityDocSpy).toHaveBeenCalled();
		expect(keyCollection).toEqual(expectedKeyCollection);
	});

	it('should not generate a new keycollection since index is found', async () => {
		const foundKeyCollection = {
			count: keyCollectionSize,
			index: keyCollectionIndex,
			keys: [{ public: 'public-key', secret: 'secret-key' }],
			publicKeyBase58: 'testpublickeybase',
			type: ''
		};
		const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityDoc').mockImplementation(async () => {
			return {} as any;
		});
		const updateIdentityDocSpy = jest.spyOn(IdentityDocsDb, 'updateIdentityDoc').mockImplementation(async () => null);
		const generateKeyCollectionSpy = jest.spyOn(ssiService, 'generateKeyCollection').mockImplementation(async () => null);
		const getKeyCollectionSpy = jest.spyOn(KeyCollectionDb, 'getKeyCollection').mockReturnValue(Promise.resolve(foundKeyCollection)); // keycollection found
		const saveKeyCollectionSpy = jest.spyOn(KeyCollectionDb, 'saveKeyCollection').mockImplementation(async () => null);

		const keyCollection = await verificationService.getKeyCollection(keyCollectionIndex);

		expect(getKeyCollectionSpy).toHaveBeenCalledWith(
			keyCollectionIndex,
			ConfigurationServiceMock.serverIdentityId,
			ConfigurationServiceMock.config.serverSecret
		);
		expect(generateKeyCollectionSpy).not.toHaveBeenCalled();
		expect(saveKeyCollectionSpy).not.toHaveBeenCalled();
		expect(getIdentitySpy).not.toHaveBeenCalled();
		expect(updateIdentityDocSpy).not.toHaveBeenCalled();
		expect(keyCollection).toEqual({ ...expectedKeyCollection, publicKeyBase58: 'testpublickeybase' });
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
