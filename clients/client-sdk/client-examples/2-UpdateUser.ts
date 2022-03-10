import { searchCriteria, IdentityClient, IdentityJson } from '@iota/is-client-sdk';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function searchIdentityAndUpdate() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  const username = 'MyUser-' + Math.ceil(Math.random() * 100000);
  const userIdentity = await identity.create(username);

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');

  // Search for identities with username 'User' in it
  const search: searchCriteria = { username: 'MyUser-' };

  const identities = await identity.search(search);

  console.log('Found the following identities:');
  console.log(JSON.stringify(identities, null, 2));

  if (identities && identities[0]) {
    // Take the latest identity of the searched identities
    const ids = identities.sort((a, b) => {
      // @ts-ignore
      return new Date(a.registrationDate) - new Date(b.registrationDate);
    });

    const userIdentity = ids[ids.length - 1];

    console.log('userIdentiy', userIdentity);

    const newUsername = 'Updated' + userIdentity.username;

    // Update the claim of the identity with a new username
    await identity.update({
      ...userIdentity,
      username: newUsername
    });
    console.log(`Successfully updated identity with id: ${userIdentity?.id}`);
  } else {
    console.log('Could not find identities with given search criteria.');
  }
}

searchIdentityAndUpdate();
