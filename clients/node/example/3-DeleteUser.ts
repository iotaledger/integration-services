import { searchCriteria, IdentityClient, Manager, IdentityKeys } from 'integration-services-node';

import { defaultConfig } from './configuration';

let identity = new IdentityClient(defaultConfig);
let rootIdentityWithKeys: IdentityKeys;

async function setup() {
  // Create db connection
  const manager = new Manager(
    process.env.MONGO_URL!,
    process.env.DB_NAME!,
    process.env.SECRET_KEY!
  );
  // Get root identity directly from db
  rootIdentityWithKeys = await manager.getRootIdentity();
  await manager.close();
}

async function searchIdentityAndDelete() {
  // Authenticate as the root identity
  await identity.authenticate(rootIdentityWithKeys.id, rootIdentityWithKeys.key.secret);

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const search: searchCriteria = { registrationDate: yesterday };
  // Search for identities that have been created yesterday or later (today)
  const identities = await identity.search(search);

  if (identities && identities[0]) {
    // Take the first identities of the searched identities
    const userIdentity = identities[0];
    // Remove the user and also revoke the user's credentials
    await identity.remove(userIdentity.id, true);
    console.log(`Successfully deleted identity with id: ${userIdentity.id}`);

    // Although the user is removed from the bridge the user's identity document can still be retrieved from the tangle
    const recoveredIdentity = await identity.latestDocument(userIdentity.id);
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
