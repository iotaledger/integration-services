import { searchCriteria, IdentityClient, IdentityJson } from 'iota-is-sdk';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndDelete() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the root identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  const username = 'User-' + Math.ceil(Math.random() * 100000);
  const userIdentity = await identity.create(username);

  console.log('Created Identity', userIdentity);

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const search: searchCriteria = { registrationDate: yesterday, username: username };
  // Search for identities that have been created yesterday or later (today)
  const identities = await identity.search(search);

  console.log('Found the following identities', identities);

  if (identities) {
    const erasableIdentities = identities.filter((item) => !item.isServerIdentity);

    if (erasableIdentities.length > 0) {
      // Take the first identities of the searched identities
      const userIdentity = erasableIdentities[0];

      console.log('Removing Identity', userIdentity);

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

searchIdentityAndDelete();
