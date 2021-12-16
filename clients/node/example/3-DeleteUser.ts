import { searchCriteria, IdentityClient, Manager, IdentityKeys } from 'integration-services-node';

import { defaultConfig, defaultManagerConfig } from './configuration';

let identity = new IdentityClient(defaultConfig);
let rootIdentityWithKeys: IdentityKeys;

async function setup() {
  // Create db connection
  const manager = new Manager(defaultManagerConfig);
  // Get root identity directly from db
  rootIdentityWithKeys = await manager.getRootIdentity();
  await manager.close();
}

async function searchIdentityAndDelete() {
  // Authenticate as the root identity
  await identity.authenticate(rootIdentityWithKeys.id, rootIdentityWithKeys.key.secret);

  const userIdentity = await identity.create('Username');

  console.log("Created Identity", userIdentity);

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const search: searchCriteria = { registrationDate: yesterday, username: 'Username' };
  // Search for identities that have been created yesterday or later (today)
  const identities = await identity.search(search);

  console.log("Found following identities", identities)

  if (identities) {

    let erasableIdentities = identities.filter(item => !item.isServerIdentity)

    if (erasableIdentities.length > 0) {

      // Take the first identities of the searched identities
      const userIdentity = erasableIdentities[0];

      console.log("Removing Identity", userIdentity)

      // Remove the user and also revoke the user's credentials
      await identity.remove(userIdentity.id, true);
      console.log(`Successfully deleted identity with id: ${userIdentity.id}`);

      // Although the user is removed from the bridge the user's identity document can still be retrieved from the tangle
      const recoveredIdentity = await identity.latestDocument(userIdentity.id);
      console.log('Identity document: ', recoveredIdentity);

    }

  } else {
    console.log('Could not find identities with given search criteria.');
  }
}

async function main() {
  await setup();
  await searchIdentityAndDelete();
}

main();
