import { CollectionNames } from './constants';
import { MongoDbService, KeyCollectionPersistence } from '@iota/is-shared-modules';
import { Bitmap } from '../services/verification-service';

const collectionName = CollectionNames.revocationBitmap;
const getIndex = (index: number, id: string) => `${id}-${index}`;

export const getBitmap = async (index: number, serverId: string): Promise<Bitmap | null> => {
	const query = { _id: getIndex(index, serverId) };
	const bitmap = await MongoDbService.getDocument<Bitmap>(collectionName, query);
	if (!bitmap) {
		return null;
	}
	return bitmap;
};

export const saveBitmap = async (bitmap: Bitmap, serverId: string) => {
	const document = {
		_id: getIndex(bitmap.index, serverId),
		...bitmap,
		created: new Date()
	};

	return MongoDbService.insertDocument<KeyCollectionPersistence>(collectionName, document);
};
