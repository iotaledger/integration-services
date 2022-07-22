import { CollectionNames } from './constants';
import { VerifiableCredentialPersistence } from '@iota/is-shared-modules';
import { MongoDbService } from '@iota/is-shared-modules/node';

const collectionName = CollectionNames.verifiableCredentials;
const getIndex = (serverId: string, index: number) => `${serverId}-${index}`;

export const getNextCredentialIndex = async (serverId: string): Promise<number> => {
	const docs = await MongoDbService.db
		.collection(collectionName)
		.aggregate([
			{
				$match: {
					serverId
				}
			},
			{
				$group: {
					_id: '$serverId',
					maxIndex: {
						$max: '$index'
					}
				}
			}
		])
		.toArray();

	return docs && docs[0] ? docs[0].maxIndex + 1 : 0;
};

export const getVerifiableCredential = async (vcHash: string): Promise<VerifiableCredentialPersistence> => {
	const regex = (text: string) => text && new RegExp(text, 'i');

	const query = { 'vc.proof.signatureValue': regex(vcHash) };
	return await MongoDbService.getDocument<VerifiableCredentialPersistence>(collectionName, query);
};

export const getVerifiableCredentials = async (id: string): Promise<VerifiableCredentialPersistence[]> => {
	const regex = (text: string) => text && new RegExp(text, 'i');

	const query = { 'vc.id': regex(id) };
	return await MongoDbService.getDocuments<VerifiableCredentialPersistence>(collectionName, query);
};

export const addVerifiableCredential = async (vcp: VerifiableCredentialPersistence, serverId: string): Promise<void> => {
	const document = {
		_id: getIndex(serverId, vcp.index),
		serverId,
		...vcp,
		created: new Date()
	};

	const res = await MongoDbService.insertDocument<VerifiableCredentialPersistence>(collectionName, document);
	if (!res?.result?.n) {
		throw new Error('could not add verifiable credential!');
	}
};

export const revokeVerifiableCredential = async (vcp: VerifiableCredentialPersistence, serverId: string) => {
	const query = {
		_id: getIndex(serverId, vcp.index)
	};

	const update: any = {
		$set: {
			isRevoked: true,
			'vc.credentialSubject': undefined
		}
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res?.result?.n) {
		throw new Error('could not revoke identity!');
	}
};
