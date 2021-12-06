import {
  Identity,
  Manager,
  ApiVersion,
  ClientConfig,
  IdentityInternal,
  IdentityJson,
} from 'integration-services-node';
import * as dotenv from 'dotenv';
dotenv.config();

let identity: Identity;
let rootIdentityWithKeys: IdentityJson;

async function setup() {
  try {
    // Create db connection
    const manager = new Manager(
      process.env.MONGO_URL!,
      process.env.DB_NAME!,
      process.env.SECRET_KEY!,
    );
    // Get root identity directly from db
    rootIdentityWithKeys = await manager.getRootIdentity();
    await manager.close();

    // Configure api access
    const config: ClientConfig = {
      apiKey: process.env.API_KEY,
      baseUrl: process.env.API_URL,
      apiVersion: ApiVersion.v1,
    };

    // Create new Identity API
    identity = new Identity(config);

    // Authenticate as the root identity
    await identity.authenticate(
      rootIdentityWithKeys.doc.id,
      rootIdentityWithKeys.key.secret,
    );
  } catch (e) {
    console.error(e);
  }
}

async function createIdentityAndCheckVCs() {
  //Get root identity
  const rootIdentity = await identity.find(rootIdentityWithKeys?.doc?.id);

  // Get root identy's VC
  // @ts-ignore: Object is possibly 'null'.
  const identityCredential = rootIdentity!.verifiableCredentials[0];

  // Create identity for user
  const userIdentity = await identity.create('User', {
    type: 'User',
  });

  console.log('~~~~~~~~~~~~~~~~');
  console.log('Created user identity: ', userIdentity);
  console.log('~~~~~~~~~~~~~~~~');
  // Assign a verifiable credential to the user as rootIdentity
  let userCredential = await identity.createCredential(
    identityCredential,
    userIdentity?.doc?.id,
    {
      profession: 'Professor',
    },
  );

  console.log('Created credential: ', userCredential);
  console.log('~~~~~~~~~~~~~~~~');
  // Verify the credential issued
  const verified = await identity.checkCredential(userCredential);

  console.log('Verification result: ', verified);
}

async function searchIdentityAndUpdate() {
  // Search for identities with username 'User' in it
  const identities = await identity.search('User');
  const userIdentity = identities[0];
  console.log(userIdentity);

  // Update the claim of the identity
  await identity.update({
    ...userIdentity,
    username: 'NewUser',
  });
}

async function main() {
  await setup();
  await createIdentityAndCheckVCs();
  await searchIdentityAndUpdate();
}

main();
