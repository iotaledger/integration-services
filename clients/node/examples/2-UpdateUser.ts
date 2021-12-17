import { searchCriteria, IdentityClient, Manager, IdentityKeys } from 'iota-is-sdk';

import { defaultConfig, defaultManagerConfig } from './configuration';

const identity = new IdentityClient(defaultConfig);
let rootIdentityWithKeys: IdentityKeys;

async function setup() {
  // Create db connection
  const manager = new Manager(defaultManagerConfig);
  // Get root identity directly from db
  rootIdentityWithKeys = await manager.getRootIdentity();
  await manager.close();
}

async function searchIdentityAndUpdate() {
  // Authenticate as the root identity
  await identity.authenticate(rootIdentityWithKeys.id, rootIdentityWithKeys.key.secret);

  // Search for identities with username 'User' in it
  const search: searchCriteria = { username: 'User' };
  const identities = await identity.search(search);

  console.log("Found those identities:");
  console.log(JSON.stringify(identities, null, 2));

  if (identities && identities[0]) {
    // Take the first identities of the searched identities
    const userIdentity = identities[0];
    // Update the claim of the identity with a new username
    await identity.update({
      ...userIdentity,
      username: 'NewUser'
    });
    console.log(`Successfully updated identity with id: ${userIdentity.id}`);
  } else {
    console.log('Could not find identities with given search criteria.');
  }
}

async function main() {
  await setup();
  await searchIdentityAndUpdate();
}

main();
