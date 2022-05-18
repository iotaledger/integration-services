import { IdentityClient, CredentialTypes, UserType, IdentityJson } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { readFileSync } from 'fs';

async function createIdentityAndCheckVCs() {
  const identity = new IdentityClient(defaultConfig);

  // Recover the admin identity
  const adminIdentity = JSON.parse(readFileSync('./adminIdentity.json').toString()) as IdentityJson;

  // Authenticate as the admin identity
  await identity.authenticate(adminIdentity.doc.id, adminIdentity.key.secret);

  // Get admin identity data
  const adminIdentityPublic = await identity.find(adminIdentity.doc.id);

  // Get admin identy's VC
  const identityCredential = adminIdentityPublic?.verifiableCredentials?.[0];

  console.log('Identity Credential of Admin', identityCredential);

  // Create identity for user
  const username = 'User-' + Math.ceil(Math.random() * 100000);
  const userIdentity = await identity.create(username);

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');
  // Assign a verifiable credential to the user as rootIdentity.
  // With the BasicIdentityCredential the user is not allowed to issue further credentials
  const userCredential = await identity.createCredential(
    identityCredential,
    userIdentity?.doc?.id,
    CredentialTypes.BasicIdentityCredential,
    UserType.Person,
    {
      profession: 'Professor'
    }
  );

  console.log('Created credential: ', userCredential);
  console.log('~~~~~~~~~~~~~~~~');
  // Verify the credential issued
  const verified = await identity.checkCredential(userCredential);

  console.log('Verification result: ', verified);
}

createIdentityAndCheckVCs();
