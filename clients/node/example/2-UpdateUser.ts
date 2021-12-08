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

async function searchIdentityAndUpdate() {
  // Search for identities with username 'User' in it
  const search: searchCriteria = { username: 'User' };
  const identities = await identity.search(search);

  if (identities && identities[0]) {
    // Take the first identities of the searched identities
    const userIdentity = identities[0];
    // Update the claim of the identity with a new username
    await identity.update({
      ...userIdentity,
      username: 'NewUser'
    });
    console.log(`Successfully updated identity with id: ${userIdentity.identityId}`);
  } else {
    console.log('Could not find identities with given search criteria.');
  }
}

async function main() {
  await setup();
  await searchIdentityAndUpdate();
}

main();
