import { CollectionNames } from './constants';
import { MongoDbService } from '../services/mongodb-service';
import { UserPersistence, UserRoles, UserSearch } from '../models/types/user';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult, UpdateWriteOpResult, WithId } from 'mongodb';
import { VerifiableCredentialJson } from '../models/types/identity';
import { MAX_NUMBER_OF_VC } from '../config/identity';

const collectionName = CollectionNames.users;
const maxNumberOfVc = MAX_NUMBER_OF_VC;

export const searchUsers = async (userSearch: UserSearch): Promise<UserPersistence[]> => {
	const regex = (text: string) => text && new RegExp(text, 'i');
	const { type, organization, username, verified, index, registrationDate } = userSearch;
	const limit = userSearch.limit != null ? userSearch.limit : 100;
	const query = {
		registrationDate: registrationDate && { $gte: registrationDate },
		type: regex(type),
		organization: regex(organization),
		username: regex(username),
		'verification.verified': verified
	};

	const plainQuery = MongoDbService.getPlainObject(query);
	const skip = index > 0 ? index * limit : 0;
	const options = { limit, skip };

	return await MongoDbService.getDocuments<UserPersistence>(collectionName, plainQuery, options);
};

export const getUser = async (identityId: string): Promise<UserPersistence | null> => {
	const query = { _id: identityId };
	return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};

export const getUsersByIds = async (identityIds: string[]): Promise<UserPersistence[] | null> => {
	const query = { _id: { $in: identityIds } };
	return await MongoDbService.getDocuments<UserPersistence>(collectionName, query);
};

export const getUserByUsername = async (username: string): Promise<UserPersistence> => {
	const query = { username };
	return await MongoDbService.getDocument<UserPersistence>(collectionName, query);
};

export const addUser = async (user: UserPersistence): Promise<InsertOneWriteOpResult<WithId<unknown>>> => {
	if (user.verifiableCredentials?.length >= maxNumberOfVc) {
		throw new Error(`You can't add more than ${maxNumberOfVc} verifiable credentials to a user!`);
	}

	const document = {
		_id: user.identityId,
		...user,
		registrationDate: new Date(),
		role: UserRoles.User
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateUser = async (user: UserPersistence): Promise<UpdateWriteOpResult> => {
	const query = {
		_id: user.identityId
	};

	const { username, organization, type, claim, verifiableCredentials } = user;

	if (verifiableCredentials?.some((vc) => vc?.id !== user.identityId)) {
		throw new Error('the passed verifiable credentials does not concur with the user!');
	}

	if (verifiableCredentials?.length >= maxNumberOfVc) {
		throw new Error(`You can't add more than ${maxNumberOfVc} verifiable credentials to a user!`);
	}

	const updateObject = MongoDbService.getPlainObject({
		username: username || undefined, // username must not be ''
		type: type || undefined, // type must not be ''
		organization,
		claim,
		verifiableCredentials
	});

	const update = {
		$set: { ...updateObject }
	};

	return MongoDbService.updateDocument(collectionName, query, update);
};

export const addUserVC = async (vc: VerifiableCredentialJson): Promise<void> => {
	const currentUser = await getUser(vc.id);
	const currentVCs = currentUser?.verifiableCredentials || [];

	if (currentUser?.verifiableCredentials?.length >= maxNumberOfVc) {
		throw new Error(`You can't add more than ${maxNumberOfVc} verifiable credentials to a user!`);
	}

	const query = {
		_id: vc.id
	};

	const updateObject = MongoDbService.getPlainObject({
		verifiableCredentials: [...currentVCs, vc]
	});

	const update = {
		$set: { ...updateObject }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update, { upsert: true });
	if (!res?.result?.n) {
		throw new Error('could not update user verifiable credential!');
	}
};

export const removeUserVC = async (vc: VerifiableCredentialJson): Promise<UserPersistence> => {
	const currentUser = await getUser(vc.id);
	const currentVCs = currentUser.verifiableCredentials || [];

	const query = {
		_id: vc.id
	};
	const filteredCredentials = currentVCs.filter((verifiableCredential) => verifiableCredential.proof.signatureValue !== vc.proof.signatureValue);

	const updateObject = MongoDbService.getPlainObject({
		verifiableCredentials: filteredCredentials
	});

	const update = {
		$set: { ...updateObject }
	};

	const res = await MongoDbService.updateDocument(collectionName, query, update);
	if (!res?.result?.n) {
		throw new Error('could not update user verifiable credential!');
	}
	return {
		...currentUser,
		verifiableCredentials: filteredCredentials
	};
};

export const deleteUser = async (identityId: string): Promise<DeleteWriteOpResultObject> => {
	const query = { _id: identityId };
	return MongoDbService.removeDocument(collectionName, query);
};
