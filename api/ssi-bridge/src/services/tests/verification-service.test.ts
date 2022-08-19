import { VerificationService } from '../verification-service';
import * as RevocationBitmapDb from '../../database/revocation-bitmap';
import * as IdentityDocsDb from '../../database/identity-keys';
import { UserService } from '../user-service';
import { SsiService } from '../ssi-service';
import { LoggerMock } from '../../test/mocks/logger';
import { ConfigurationServiceMock } from '../../test/mocks/service-mocks';

describe('test getBitmap', () => {
	let ssiService: SsiService, userService: UserService, verificationService: VerificationService;
	const keys = {
		type: 'ed25519',
		public: [
			253, 253, 83, 117, 253, 6, 253, 253, 253, 103, 15, 69, 75, 253, 253, 1, 8, 253, 253, 253, 253, 253, 51, 253, 253, 159, 253, 98, 253,
			30
		],
		private: [
			253, 253, 253, 16, 106, 253, 253, 81, 253, 253, 253, 253, 48, 253, 68, 88, 253, 253, 11, 118, 253, 57, 85, 253, 253, 124, 2, 69, 253,
			60, 82
		]
	};
	const bitmapIndex = 0;
	const serverSecret = ConfigurationServiceMock.config.serverSecret;
	const bitmapMock = {
		id: 'did:iota:4wUQAs9zrPGuq5txf3m88g7gosfxS24Tzr4V9SiDT8Sc#signature-bitmap-0',
		serviceEndpoint: 'data:application/octet-stream;base64,ZUp5ek1tQmdZR1NBQUFFZ1ptTUFBQWZRQUlJ',
		index: 0,
		type: 'RevocationBitmap2022'
	};

	beforeEach(() => {
		ssiService = SsiService.getInstance({} as any, LoggerMock);
		userService = new UserService(ssiService, serverSecret, LoggerMock);
		verificationService = new VerificationService(ssiService, userService, LoggerMock, ConfigurationServiceMock);
	});

	it('should generate a new bitmap since index not found', async () => {
		const expectedBitmap = { id: bitmapMock.id, index: bitmapMock.index, serviceEndpoint: bitmapMock.serviceEndpoint };
		const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockReturnValue(Promise.resolve({} as any));
		const restoreIdentitySpy = jest.spyOn(ssiService, 'restoreIdentity').mockReturnValue(Promise.resolve({ key: keys } as any));
		const createRevocationBitmapSpy = jest.spyOn(ssiService, 'createRevocationBitmap').mockReturnValue(Promise.resolve(bitmapMock));
		const getBitmapSpy = jest.spyOn(RevocationBitmapDb, 'getBitmap').mockReturnValue(Promise.resolve(null)); // no bitmap found
		const saveBitmapSpy = jest.spyOn(RevocationBitmapDb, 'saveBitmap').mockReturnValue(Promise.resolve({ result: { n: 1 } } as any));
		const bitmap = await verificationService.getBitmap(bitmapIndex);

		expect(getBitmapSpy).toHaveBeenCalledWith(bitmapIndex, ConfigurationServiceMock.serverIdentityId);
		expect(restoreIdentitySpy).toHaveBeenCalledWith({});
		expect(createRevocationBitmapSpy).toHaveBeenCalledWith(bitmapIndex, {
			id: ConfigurationServiceMock.serverIdentityId,
			key: keys
		});
		expect(saveBitmapSpy).toHaveBeenCalledWith(expectedBitmap, ConfigurationServiceMock.serverIdentityId);
		expect(getIdentitySpy).toHaveBeenCalled();
		expect(bitmap).toEqual(expectedBitmap);
	});

	it('should not generate a new bitmap since index is found', async () => {
		const expectedBitmap = { id: bitmapMock.id, index: bitmapMock.index, serviceEndpoint: bitmapMock.serviceEndpoint };
		const getIdentitySpy = jest.spyOn(IdentityDocsDb, 'getIdentityKeys').mockImplementation(async () => {
			return {} as any;
		});
		const createRevocationBitmapSpy = jest.spyOn(ssiService, 'createRevocationBitmap').mockImplementation(async () => null);
		const saveBitmapSpy = jest.spyOn(RevocationBitmapDb, 'saveBitmap').mockImplementation(async () => null);
		const getBitmapSpy = jest.spyOn(RevocationBitmapDb, 'getBitmap').mockImplementation(async () => expectedBitmap);
		const bitmap = await verificationService.getBitmap(bitmapIndex);

		expect(getBitmapSpy).toHaveBeenCalledWith(bitmapIndex, ConfigurationServiceMock.serverIdentityId);
		expect(createRevocationBitmapSpy).not.toHaveBeenCalled();
		expect(saveBitmapSpy).not.toHaveBeenCalled();
		expect(getIdentitySpy).not.toHaveBeenCalled();
		expect(bitmap).toEqual(expectedBitmap);
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});
});
