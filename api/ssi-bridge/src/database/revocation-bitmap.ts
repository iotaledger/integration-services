import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/node';
import { Bitmap } from '@iota/is-shared-modules';

const collectionName = CollectionNames.revocationBitmap;
const getIndex = (index: number, id: string) => `${id}-${index}`;

export const getBitmap = async (index: number, serverId: string): Promise<Bitmap | null> => {
	const query = { _id: getIndex(index, serverId) };
	const bitmap = await MongoDbService.getDocument<Bitmap>(collectionName, query);
	return bitmap;
};

export const saveBitmap = async (bitmap: Bitmap, serverId: string) => {
	const document = {
		_id: getIndex(bitmap.index, serverId),
		...bitmap,
		created: new Date()
	};

	return MongoDbService.insertDocument<Bitmap>(collectionName, document);
};
