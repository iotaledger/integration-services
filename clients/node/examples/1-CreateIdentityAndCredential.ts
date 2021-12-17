import { IdentityClient, Manager, CredentialTypes, UserType, IdentityKeys } from 'iota-is-sdk';

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

async function createIdentityAndCheckVCs() {

  // Authenticate as the root identity
  await identity.authenticate(rootIdentityWithKeys.id, rootIdentityWithKeys.key.secret);

  //Get root identity
  const rootIdentity = await identity.find(rootIdentityWithKeys?.id);

  // Get root identy's VC
  // @ts-ignore: Object is possibly 'null'.
  const identityCredential = rootIdentity!.verifiableCredentials[0];

  console.log("Identity Credential of Root", identityCredential);

  // Create identity for user
  const userIdentity = await identity.create('User');

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');
  // Assign a verifiable credential to the user as rootIdentity
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

async function main() {
  await setup();
  await createIdentityAndCheckVCs();
}

main();
