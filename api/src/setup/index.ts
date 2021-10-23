import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from '../services/mongodb-service';
import { CONFIG } from '../config';
import { UserService } from '../services/user-service';
import { SsiService } from '../services/ssi-service';
import { VerificationService } from '../services/verification-service';
import { addTrustedRootId } from '../database/trusted-roots';
import { createNonce, getHexEncodedKey, signNonce, verifySignedNonce } from '../utils/encryption';
import { CreateIdentityBody, IdentityJsonUpdate } from '../models/types/identity';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import { KEY_COLLECTION_SIZE } from '../config/identity';
import { CredentialTypes, Subject } from '../models/types/verification';
import { Logger } from '../utils/logger';
import * as serverIdentityJson from '../config/server-identity.json';

import { existsSync, readFileSync, writeFileSync } from 'fs';

const logger = Logger.getInstance();
const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;
const serverSecret = CONFIG.serverSecret;
const serverIdentityId = CONFIG.serverIdentityId;

// Read root identity (if exists) from SERVER_IDENTITY path
export function readRootIdentity() {

	if (!serverIdentityId) {
		throw Error('SERVER_IDENTITY must be defined as environment variable');
	}

	if (!existsSync(serverIdentityId)) {
		logger.error('SERVER_IDENTITY file does not exists');
		return
	}

	try {
		const rootIdentity = JSON.parse(readFileSync(serverIdentityId).toString());
		if (!rootIdentity.root) {
			logger.error('root field missing in the SERVER_IDENTITY file');
			return;
		}
		return rootIdentity.root
	}
	catch (e) {
		logger.error('SERVER_IDENTITY file malformed');
	}

	return null;

}

// Ensure that on the db there is the declared root identity
export async function checkRootIdentity() {

	logger.log(`Checking root identity...`);

	if (!serverSecret) {
		logger.error('A server secret must be defined to setup the api!');
		return null;
	}

	const serverIdentityId = readRootIdentity();
	if (!serverIdentityId) {
		logger.error("Root identity not found: use keygen")
		return null;
	}

	await MongoDbService.connect(dbUrl, dbName);

	const ssiService = SsiService.getInstance(CONFIG.identityConfig, logger);
	const userService = new UserService(ssiService, serverSecret, logger);
	const tmpVerificationService = new VerificationService(
		ssiService,
		userService,
		{
			serverSecret,
			serverIdentityId,
			keyCollectionSize: KEY_COLLECTION_SIZE
		},
		logger
	);

	const serverIdentity = await tmpVerificationService.getIdentityFromDb(serverIdentityId);

	if (!serverIdentity) {
		logger.error('Root identity not found in database: ' + serverIdentityId);
		return null;
	}
	
	return serverIdentity;

}

// Check if identity is a valid one
export async function verifyIdentity(serverIdentity: IdentityJsonUpdate) {

	// verify if secret key of the server can be used to sign and verify a challenge
	// if the secret key was changed the server won't be able to decrypt the secret key of the server
	// and thus is not able to verify the challenge
	logger.log('Check if server has valid keypair...');
	const nonce = createNonce();
	let verified = false;
	try {
		const signedNonce = await signNonce(getHexEncodedKey(serverIdentity.key.secret), nonce);
		verified = await verifySignedNonce(getHexEncodedKey(serverIdentity.key.public), nonce, signedNonce);
	} catch (e) {
		logger.error('error when signing or verifying the nonce, the secret key might have changed...');
	}
	if (!verified) {
		logger.error('server keys cannot be verified!');
		return;
	}

	logger.log('Api is ready to use!');
	return true;

}

async function getRootIdentityFromId(serverIdentityId: string) : Promise<IdentityJsonUpdate> {

	await MongoDbService.connect(dbUrl, dbName);

	// TODO create database, documents and indexes in mongodb at the first time!
	// key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

	const ssiService = SsiService.getInstance(CONFIG.identityConfig, logger);
	const userService = new UserService(ssiService, serverSecret, logger);
	const tmpVerificationService = new VerificationService(
		ssiService,
		userService,
		{
			serverSecret,
			serverIdentityId,
			keyCollectionSize: KEY_COLLECTION_SIZE
		},
		logger
	);

	return await tmpVerificationService.getIdentityFromDb(serverIdentityId);

}

// Setup root identity
export async function setupApi() {

	logger.log(`Setting root identity please wait...`);

	if (!serverSecret) {
		throw Error('A server secret must be defined to setup the api!');
	}

	// Get root identity based on configuration
	const rootIdentity = readRootIdentity();

	if (rootIdentity) {
		logger.error('Root identity already exists: verify it')
		const serverIdentity = await getRootIdentityFromId(rootIdentity)
		if (verifyIdentity(serverIdentity)) {
			logger.log('Root identity is already defined and present on database')
			process.exit(0);
			return;
		}
	}

	logger.log('Create identity...');

	const serverData: CreateIdentityBody = serverIdentityJson;

	await MongoDbService.connect(dbUrl, dbName);

	const ssiService = SsiService.getInstance(CONFIG.identityConfig, logger);
	const userService = new UserService(ssiService, serverSecret, logger);
	const identity = await userService.createIdentity(serverData);

	logger.log('==================================================================================================');
	logger.log(`== Store this identity in the as ENV var: ${identity.doc.id} ==`);
	logger.log('==================================================================================================');

	// logger.log(JSON.stringify(identity, null, 2))

	// re-create the verification service with a valid server identity id
	const verificationService = new VerificationService(
		ssiService,
		userService,
		{
			serverSecret,
			serverIdentityId: identity.doc.id,
			keyCollectionSize: KEY_COLLECTION_SIZE
		},
		logger
	);

	const serverUser = await userService.getUser(identity.doc.id);
	if (!serverUser) {
		throw new Error('server user not found!');
	}
	logger.log('Add server id as trusted root...');
	await addTrustedRootId(serverUser.identityId);

	logger.log('Generate key collection...');
	const index = await VerifiableCredentialsDb.getNextCredentialIndex(this.serverIdentityId);
	const keyCollectionIndex = verificationService.getKeyCollectionIndex(index);
	const kc = await verificationService.getKeyCollection(keyCollectionIndex);

	if (!kc) {
		throw new Error('could not create the keycollection!');
	}

	logger.log('Set server identity as verified...');
	const subject: Subject = {
		claim: serverUser.claim,
		credentialType: CredentialTypes.VerifiedIdentityCredential,
		identityId: serverUser.identityId
	};
	await verificationService.verifyIdentity(subject, serverUser.identityId, serverUser.identityId);

	// logger.log(`Setup Done!\nPlease store the generated server identity as environment variable.\nLike: SERVER_IDENTITY=${serverUser.identityId}`);

	writeFileSync(serverIdentityId, JSON.stringify({
		root: serverUser.identityId
	}));

	process.exit(0);

}
