import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import { userService, verificationService } from '../../routers/services';
import { ConfigurationService } from '../../services/configuration-service';
import { Logger } from '../../utils/logger';
import { MongoDbService, UserRoles, UserType, CredentialTypes } from '@iota/is-shared-modules';
import { CollectionNames } from '../../database/constants';

/**
 * Create an identity, issue a credential from the root identity and set its role to admin.
 */
const setupAdminIdentity = async () => {
	try {
		const configService = ConfigurationService.getInstance(Logger.getInstance());
		const config = configService.config;

		await MongoDbService.connect(config.databaseUrl, config.databaseName);

		const rootIdentity = await configService.getRootIdentityId();
		const adminIdentity = await userService.createIdentity({
			username: `Admin-${Math.ceil(Math.random() * 100000)}`,
			claim: { type: UserType.Organization }
		});

		await createCredential(adminIdentity.doc.id().toString(), rootIdentity);
		await setAdminRole(adminIdentity.doc.id().toString());

		fs.writeFileSync('./adminIdentity.json', JSON.stringify(adminIdentity, null, 4));
		console.log('The identity was successfully created and saved in the adminIdentity.json file!');
	} catch (e: any) {
		console.log('Was not able to setup admin identity.', e);
	} finally {
		await MongoDbService.disconnect();
	}
};

const createCredential = async (targetId: string, issuerId: string) => {
	await verificationService.issueVerifiableCredential(
		{
			id: targetId,
			credentialType: CredentialTypes.VerifiedIdentityCredential,
			claim: {
				type: UserType.Organization
			}
		},
		issuerId,
		issuerId
	);
};

const setAdminRole = async (targetId: string) => {
	await MongoDbService.updateDocument(
		CollectionNames.users,
		{
			_id: targetId
		},
		{
			$set: { role: UserRoles.Admin }
		}
	);
};

setupAdminIdentity();
