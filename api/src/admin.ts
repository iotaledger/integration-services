import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';
import { UserService } from './services/user-service';
import { IdentityService } from './services/identity-service';
import { AuthenticationService } from './services/authentication-service';
import { addTrustedRootId } from './database/trusted-roots';

const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;
const serverSecret = CONFIG.serverSecret;
const serverIdentityId = CONFIG.serverIdentityId;

async function setupApi() {
	console.log(`Setting api please wait...`);
	await MongoDbService.connect(dbUrl, dbName);
	// TODO create database, documents and indexes in mongodb at the first time!
	// key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

	const userService = new UserService();
	const identityService = IdentityService.getInstance(CONFIG.identityConfig);
	const authenticationService = new AuthenticationService(identityService, userService, { jwtExpiration: '2 days', serverSecret, serverIdentityId });

	const keyCollection = await authenticationService.getKeyCollection(0);
	console.log('keyCollection', keyCollection);

	if (!keyCollection) {
		console.log('add key collections');
		const identity = await authenticationService.createIdentity({
			storeIdentity: true,
			username: 'api-identity',
			classification: 'api',
			organization: 'IOTA',
			subscribedChannelIds: [],
			description: 'Root identity of the api!'
		});
		console.log('==================================================================================================');
		console.log(`== Store this identity in the as ENV var: ${identity.doc.id} ==`);
		console.log('==================================================================================================');

		const serverUser = await userService.getUser(identity.doc.id);
		if (!serverUser) {
			throw new Error('server user not found!');
		}
		console.log('add server id as trusted root...');
		await addTrustedRootId(serverUser.userId);

		console.log('generate key collection...');
		const kc = await authenticationService.generateKeyCollection(serverUser.userId);
		const res = await authenticationService.saveKeyCollection(kc);

		if (!res?.result.n) {
			throw new Error('could not save keycollection!');
		}
		console.log('set server identity as verified...');
		await authenticationService.verifyUser(serverUser, serverUser.userId, serverUser.userId);
	} else {
		console.log('key collection already there!');
	}

	console.log('done :)');
	process.exit(0);
}

setupApi();
