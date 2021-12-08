import {
  Identity,
  Manager,
  ApiVersion,
  ClientConfig,
  IdentityJson
} from 'integration-services-node';
import * as dotenv from 'dotenv';
import { searchCriteria } from '../src/models/searchCriteria';
dotenv.config();

let identity: Identity;
let rootIdentityWithKeys: IdentityJson;

async function setup() {
  try {
    // Create db connection
    const manager = new Manager(
      process.env.MONGO_URL!,
      process.env.DB_NAME!,
      process.env.SECRET_KEY!
    );
    // Get root identity directly from db
    rootIdentityWithKeys = await manager.getRootIdentity();
    await manager.close();

    // Configure api access
    const config: ClientConfig = {
      apiKey: process.env.API_KEY!,
      baseUrl: process.env.API_URL,
      apiVersion: ApiVersion.v1
    };

    // Create new Identity API
    identity = new Identity(config);

    // Authenticate as the root identity
    await identity.authenticate(rootIdentityWithKeys.doc.id, rootIdentityWithKeys.key.secret);
  } catch (e) {
    console.error(e);
  }
}

async function searchIdentityAndDelete() {
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const search: searchCriteria = { registrationDate: yesterday };
  // Search for identities that have been created yesterday or later (today)
  const identities = await identity.search(search);

  if (identities && identities[0]) {
    // Take the first identities of the searched identities
    const userIdentity = identities[0];
    // Remove the user and also revoke the user's credentials
    await identity.remove(userIdentity.identityId, true);
    console.log(`Successfully deleted identity with id: ${userIdentity.identityId}`);
    // Although the user is removed from the bridge the user's identity document can still be retrieved from the tangle
    const recoveredIdentity = await identity.latestDocument(userIdentity.identityId);
    console.log('Identity document: ', recoveredIdentity);
  } else {
    console.log('Could not find identities with given search criteria.');
  }
}

async function main() {
  await setup();
  await searchIdentityAndDelete();
}

main();
