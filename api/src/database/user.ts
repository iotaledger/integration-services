import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { UserPersistence, UserRoles, UserSearch, VerificationPersistence, VerificationUpdatePersistence } from '../models/types/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { VerifiableCredentialJson } from '../models/types/identity';

const collectionName = CollectionNames.users;

export const searchUsers = async (userSearch: UserSearch): Promise<UserPersistence[]> => {
	const regex = (text: string) => text && new RegExp(text, 'i');
	const { classification, organization, subscribedChannelIds, username, verified, index, registrationDate } = userSearch;
	const limit = userSearch.limit != null ? userSearch.limit : 100;
	const query = {
		registrationDate: registrationDate && { $gte: registrationDate },
		classification: regex(classification),
		organization: regex(organization),
		username: regex(username),
		'verification.verified': verified,
		subscribedChannelIds: subscribedChannelIds && { $in: subscribedChannelIds }
	};

	const plainQuery = MongoDbService.getPlainObject(query);
	const skip = index > 0 ? (index - 1) * limit : 0;
	const options = { limit, skip };

	return await MongoDbService.getDocuments<UserPersistence>(collectionName, plainQuery, options);
};

export const getUser = async (userId: string): Promise<UserPersistence | null> => {
	const query = { _id: userId };
	return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};

export const getUsersByIds = async (userIds: string[]): Promise<UserPersistence[] | null> => {
	const query = { _id: { $in: userIds } };
	return await MongoDbService.getDocuments<UserPersistence>(collectionName, query);
};

export const getUserByUsername = async (username: string): Promise<UserPersistence> => {
	const query = { username };
	return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};

export const addUser = async (user: UserPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	delete user.verification;

	const document = {
		_id: user.userId,
		...user,
		registrationDate: new Date(),
		role: UserRoles.User
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateUser = async (user: UserPersistence): Promise<UpdateWriteOpResult> => {
	const query = {
		_id: user.userId
	};

	const { username, organization, subscribedChannelIds, description, classification, details, verifiableCredentials } = user;

	if (verifiableCredentials?.some((vc) => vc?.id !== user.userId)) {
		throw new Error('the passed verifiable credentials does not concur with the user!');
	}

	const updateObject = MongoDbService.getPlainObject({
		description,
		username: username || undefined, // username must not be ''
		classification: classification || undefined, // username must not be ''
		organization,
		subscribedChannelIds,
		details,
		verifiableCredentials
	});

	const update = {
		$set: { ...updateObject }
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const updateUserVerification = async (vup: VerificationUpdatePersistence): Promise<void> => {
	const query = {
		_id: vup.userId
	};
	const verification: VerificationPersistence = {
		verified: vup.verified,
		verificationDate: vup.verificationDate,
		lastTimeChecked: vup.lastTimeChecked,
		verificationIssuerId: vup.verificationIssuerId
	};

	const updateObject = MongoDbService.getPlainObject({
		verification: MongoDbService.getPlainObject(verification)
	});

	const update = {
		$set: { ...updateObject }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res?.result?.n) {
		throw new Error('could not update user verification!');
	}
};

export const addUserVC = async (vc: VerifiableCredentialJson): Promise<void> => {
	const currentUser = await getUser(vc.id);
	const currentVCs = currentUser.verifiableCredentials || [];

	const query = {
		_id: vc.id
	};

	const updateObject = MongoDbService.getPlainObject({
		verifiableCredentials: [...currentVCs, vc]
	});

	const update = {
		$set: { ...updateObject }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res?.result?.n) {
		throw new Error('could not update user verifiable credential!');
	}
};

export const deleteUser = async (userId: string): Promise<DeleteWriteOpResultObject> => {
	const query = { _id: userId };
	return MongoDbService.removeDocument(collectionName, query);
};
