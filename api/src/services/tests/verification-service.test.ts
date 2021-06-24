import { VerificationService } from '../verification-service';
import * as KeyCollectionDb from '../../database/key-collection';
import * as IdentityDocsDb from '../../database/identity-docs';
import { VerificationServiceConfig } from '../../models/config/services';
import { UserService } from '../user-service';
import { SsiService } from '../ssi-service';
import { LoggerMock } from '../../test/mocks/logger';

describe('test getKeyCollection', () => {
	let ssiService: SsiService, userService: UserService, verificationService: VerificationService;
	const keyCollectionIndex = 0;
	const keyCollectionSize = 4;
	const expectedKeyCollection = {
		count: keyCollectionSize,
		index: keyCollectionIndex,
		keys: [{ public: 'public-key', secret: 'secret-key' }],
		type: ''
	};
	const cfg: VerificationServiceConfig = {
		serverSecret: 'very-secret-secret',
		serverIdentityId: 'did:iota:123',
		keyCollectionSize
	};
	beforeEach(() => {
		ssiService = SsiService.getInstance({} as any, LoggerMock);
		userService = new UserService(ssiService, 'very-secret-secret', LoggerMock);
		verificationService = new VerificationService(ssiService, userService, cfg, LoggerMock);
	});

	it('should generate a new keycollection since index not found', async () => {
		const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue({});
		const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
		const generateKeyCollectionSpy = spyOn(ssiService, 'generateKeyCollection').and.returnValue({
			keyCollectionJson: { index: keyCollectionIndex, count: keyCollectionSize, type: '', keys: [{ public: 'public-key', secret: 'secret-key' }] },
			docUpdate: {}
		});
		const getKeyCollectionSpy = spyOn(KeyCollectionDb, 'getKeyCollection').and.returnValue(null); // no keycollection found
		const saveKeyCollectionSpy = spyOn(KeyCollectionDb, 'saveKeyCollection').and.returnValue({ result: { n: 1 } });

		const keyCollection = await verificationService.getKeyCollection(keyCollectionIndex);

		expect(getKeyCollectionSpy).toHaveBeenCalledWith(keyCollectionIndex, cfg.serverIdentityId, cfg.serverSecret);
		expect(generateKeyCollectionSpy).toHaveBeenCalledWith(keyCollectionIndex, keyCollectionSize, {});
		expect(saveKeyCollectionSpy).toHaveBeenCalledWith(expectedKeyCollection, 'did:iota:123', 'very-secret-secret');
		expect(getIdentitySpy).toHaveBeenCalled();
		expect(updateIdentityDocSpy).toHaveBeenCalled();
		expect(keyCollection).toEqual(expectedKeyCollection);
	});

	it('should not generate a new keycollection since index is found', async () => {
		const foundKeyCollection = {
			count: keyCollectionSize,
			index: keyCollectionIndex,
			keys: [{ public: 'public-key', secret: 'secret-key' }],
			type: ''
		};
		const getIdentitySpy = spyOn(IdentityDocsDb, 'getIdentity').and.returnValue({});
		const updateIdentityDocSpy = spyOn(IdentityDocsDb, 'updateIdentityDoc');
		const generateKeyCollectionSpy = spyOn(ssiService, 'generateKeyCollection');
		const getKeyCollectionSpy = spyOn(KeyCollectionDb, 'getKeyCollection').and.returnValue(foundKeyCollection); // keycollection found
		const saveKeyCollectionSpy = spyOn(KeyCollectionDb, 'saveKeyCollection');
		const keyCollection = await verificationService.getKeyCollection(keyCollectionIndex);

		expect(getKeyCollectionSpy).toHaveBeenCalledWith(keyCollectionIndex, cfg.serverIdentityId, cfg.serverSecret);
		expect(generateKeyCollectionSpy).not.toHaveBeenCalled();
		expect(saveKeyCollectionSpy).not.toHaveBeenCalled();
		expect(getIdentitySpy).not.toHaveBeenCalled();
		expect(updateIdentityDocSpy).not.toHaveBeenCalled();
		expect(keyCollection).toEqual(expectedKeyCollection);
	});
});
