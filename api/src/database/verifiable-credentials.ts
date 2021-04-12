import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { VerifiableCredentialPersistence } from '../models/types/key-collection';

const collectionName = CollectionNames.verifiableCredentials;
const getIndex = (vcp: VerifiableCredentialPersistence, serverId: string) => `${serverId}-${vcp.keyCollectionIndex}-${vcp.index}`;

// TODO#54 get highest index instead of size. So a complete deleted entry does not break the logic!
// get highest keyCollectionIndex as well & generate new keycollection dynamically
export const getNextCredentialIndex = async (keyCollectionIndex: number, serverId: string): Promise<number> => {
	const query = { keyCollectionIndex, serverId };
	return MongoDbService.db.collection(collectionName).countDocuments(query);
};

export const getVerifiableCredential = async (did: string, vcHash: string, serverId: string): Promise<VerifiableCredentialPersistence> => {
	const regex = (text: string) => text && new RegExp(text, 'i');

	const query = { 'vc.id': regex(did), 'vc.proof.signatureValue': regex(vcHash) };
	return await MongoDbService.getDocument<VerifiableCredentialPersistence>(collectionName, query);
};

export const addVerifiableCredential = async (vcp: VerifiableCredentialPersistence, serverId: string): Promise<void> => {
	const document = {
		_id: getIndex(vcp, serverId),
		serverId,
		...vcp
	};

	const res = await MongoDbService.insertDocument<VerifiableCredentialPersistence>(collectionName, document);
	if (!res?.result?.n) {
		throw new Error('could not add verifiable credential!');
	}
};

export const revokeVerifiableCredential = async (vcp: VerifiableCredentialPersistence, serverId: string) => {
	const query = {
		_id: getIndex(vcp, serverId)
	};

	const update: any = {
		$set: {
			isRevoked: true
		}
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res?.result.n) {
		throw new Error('could not revoke identity!');
	}
};
