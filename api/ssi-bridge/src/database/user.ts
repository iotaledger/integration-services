import { CollectionNames } from './constants';
import { MongoDbService } from '@iota/is-shared-modules/lib/services/mongodb-service';
import { UserPersistence, UserRoles, UserSearch } from '@iota/is-shared-modules/lib/models/types/user';
import { VerifiableCredentialJson } from '@iota/is-shared-modules/lib/models/types/identity';

const collectionName = CollectionNames.users;
const maxNumberOfVc = 100;

export const searchUsers = async (userSearch: UserSearch): Promise<UserPersistence[]> => {
	const searchMaximum = 100;
	const regex = (text: string) => text && new RegExp(text, 'i');
	const { type, username, creator, index, registrationDate, ascending } = userSearch;
	const sort = ascending != null ? { registrationDate: ascending ? 1 : -1 } : undefined;
	const limit = userSearch.limit != null ? userSearch.limit : searchMaximum;
	const query = {
		registrationDate: registrationDate && { $gte: registrationDate },
		'claim.type': regex(type),
		username: regex(username),
		creator: regex(creator)
	};

	const plainQuery = MongoDbService.getPlainObject(query);
	const skip = index > 0 ? index * limit : 0;
	const options = { limit, skip, sort };

	return await MongoDbService.getDocuments<UserPersistence>(collectionName, plainQuery, options);
};

export const getServerIdentities = async (): Promise<UserPersistence[] | null> => {
	const query = { isServerIdentity: true };
	return await MongoDbService.getDocuments<UserPersistence>(collectionName, query);
};

export const getUser = async (id: string): Promise<UserPersistence | null> => {
	const query = { _id: id };
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

export const addUser = async (user: UserPersistence) => {
	if (user.verifiableCredentials?.length >= maxNumberOfVc) {
		throw new Error(`You can't add more than ${maxNumberOfVc} verifiable credentials to a user!`);
	}

	const document = {
		_id: user.id,
		...user,
		registrationDate: new Date(),
		role: UserRoles.User
	};

	return MongoDbService.insertDocument(collectionName, document);
};

export const updateUser = async (user: UserPersistence) => {
	const query = {
		_id: user.id
	};

	const { username, claim, verifiableCredentials, isPrivate } = user;

	if (verifiableCredentials?.some((vc) => vc?.id !== user.id)) {
		throw new Error('the passed verifiable credentials does not concur with the user!');
	}

	if (verifiableCredentials?.length >= maxNumberOfVc) {
		throw new Error(`You can't add more than ${maxNumberOfVc} verifiable credentials to a user!`);
	}

	const updateObject = MongoDbService.getPlainObject({
		username: username || undefined, // username must not be ''
		claim,
		verifiableCredentials,
		isPrivate
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
	const filteredCredentials = currentVCs.filter(
		(verifiableCredential) => verifiableCredential.proof.signatureValue !== vc.proof.signatureValue
	);

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

export const deleteUser = async (id: string) => {
	const query = { _id: id };
	return MongoDbService.removeDocument(collectionName, query);
};
