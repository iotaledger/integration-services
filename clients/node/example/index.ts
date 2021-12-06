import { ClientConfig } from 'iota-is-client';
import { Manager } from 'iota-is-client';
import { ApiVersion } from 'iota-is-client';
import { Identity } from 'iota-is-client';
import { IdentityInternal } from 'iota-is-client';

let identity: Identity;

let rootId: any;
async function bootstrap() {
  try {

    let manager = new Manager(
      'mongodb://root:rootpassword@localhost:27017', 
      'e-commerce-tools', 
      'PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa'
    );
​
    rootId = await manager.getRootIdentity();

    await manager.close();
​
    console.log('Root Identity', rootId);
​
    const config: ClientConfig = {
      apiKey: '94F5BA49-12B6-4E45-A487-BF91C442276D',
      baseUrl: 'http://127.0.0.1:3000',
      apiVersion: ApiVersion.v1
    }
     ​
    identity = new Identity(config);
 ​
    // Became root identity
    await identity.authenticate(rootId);
    
    console.log(identity.jwtToken)


    // Searching for identities
    const user = await identity.search('tester user')
    console.log('Search result: ', user)


  } catch (e: any) {
    console.log(e);
  }
}

async function createIdentityAndCheckVCs() {
  try {
    
    // Get information about root identity
    let rootIdentity = (await identity.find(rootId?.doc?.id)) as IdentityInternal;
    const verifiableCredentials = rootIdentity!.verifiableCredentials;
    let identityCredential = verifiableCredentials ? verifiableCredentials[0] : null
    if (!identityCredential) {
      throw new Error('root identity has no credential')
    }
​
    console.log('Root Identity Credentials', identityCredential);

    // Verify the credential issued
    let verified = await identity.checkCredential(identityCredential);

    console.log('Verification result', verified);
    ​
    // Create identity for tester
    let userIdentity = await identity.create('tester user', {
      type: 'user'
    });
​
    console.log('Tester Identity', userIdentity);
​
    // Assign a verifiable credential to the tester as rootIdentity
    let vc = await identity.createCredential(identityCredential!, userIdentity?.doc?.id, {
      profession: 'Professor'
    });

    console.log("Credential created", vc);
​
    console.log('Tester Verifiable Credential');

    // Verify the credential issued
    let verified2 = await identity.checkCredential(identityCredential);

    console.log('Verification result', verified2);
  } catch(e) {
    console.error(e)
  }
}
​
async function main() {
  await bootstrap();
  createIdentityAndCheckVCs();
}

main()
