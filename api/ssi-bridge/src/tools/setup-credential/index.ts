import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { userService, verificationService } from '../../routers/services';
import { ConfigurationService } from '../../services/configuration-service';
import { Logger } from '../../utils/logger';
import { MongoDbService } from '@iota/is-shared-modules/lib/services/mongodb-service';
import { UserRoles, UserType } from '@iota/is-shared-modules/lib/models/types/user';
import { CollectionNames } from '../../database/constants';
import { CredentialTypes } from '@iota/is-shared-modules/lib/models/types/verification';

/**
 * Issues a credential from the root identity to a newly created identity and sets its role to admin
 */
const setupCredential = async () => {
	try {
		const configService = ConfigurationService.getInstance(Logger.getInstance());
		const config = configService.config;

		await MongoDbService.connect(config.databaseUrl, config.databaseName);

		const rootIdentity = await configService.getRootIdentityId();
		const adminIdentity = await userService.createIdentity({
			username: `Admin-${Math.ceil(Math.random() * 100000)}`,
			claim: { type: UserType.Organization }
		});

		await createCredential(adminIdentity.doc.id, rootIdentity);
		await setAdminRole(adminIdentity.doc.id);

		fs.writeFileSync('./adminIdentity.json', JSON.stringify(adminIdentity, null, 4));
		console.log('The identity was successfully created and saved in the adminIdentity.json file!');
	} catch (e: any) {
		console.log('Was not able to setup admin credential.', e);
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

setupCredential();
