import { searchCriteria, IdentityClient, IdentityJson } from 'iota-is-sdk';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndUpdate() {

  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync("./adminIdentity.json").toString()) as IdentityJson;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  // Search for identities with username 'User' in it
  const search: searchCriteria = { username: 'User' };

  const identities = await identity.search(search);

  console.log("Found the following identities:");
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

searchIdentityAndUpdate();

