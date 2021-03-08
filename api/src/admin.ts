import * as dotenv from 'dotenv';
dotenv.config();
import { MongoDbService } from './services/mongodb-service';
import { CONFIG } from './config';
import { UserService } from './services/user-service';
import { IdentityService } from './services/identity-service';
import { AuthenticationService } from './services/authentication-service';

const dbUrl = CONFIG.databaseUrl;
const dbName = CONFIG.databaseName;

async function setupApi() {
  console.log(`Setting api please wait...`);
  await MongoDbService.connect(dbUrl, dbName);
  // TODO create database, documents and indexes in mongodb at the first time!
  // key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})

  const userService = new UserService();
  const identityService = IdentityService.getInstance(CONFIG.identityConfig);
  const authenticationService = new AuthenticationService(identityService, userService, CONFIG);

  const keyCollection = await authenticationService.getKeyCollection(0);
  console.log('keyCollection', keyCollection);

  if (!keyCollection) {
    const kc = await authenticationService.generateKeyCollection();
    const res = await authenticationService.saveKeyCollection(kc);

    if (!res?.result.n) {
      console.log('could not save keycollection!');
    }
  }

  const identity = await identityService.getLatestIdentity(process.env.SERVER_IDENTITY);
  await authenticationService.updateDatabaseIdentityDoc({
    id: 'did:iota:DfBThepKpwti6wGnnvZ3cV9uB5z9JLEFygYvhX876niS',
    verificationMethod: [
      {
        id: 'did:iota:DfBThepKpwti6wGnnvZ3cV9uB5z9JLEFygYvhX876niS#key-collection',
        controller: 'did:iota:DfBThepKpwti6wGnnvZ3cV9uB5z9JLEFygYvhX876niS',
        type: 'MerkleKeyCollection2021',
        publicKeyBase58: '11ExviQHmmu25vtVhaBorZt3ZnQWfvEuEuQXsCB8RCkRfs'
      }
    ],
    authentication: [
      {
        id: 'did:iota:DfBThepKpwti6wGnnvZ3cV9uB5z9JLEFygYvhX876niS#key',
        controller: 'did:iota:DfBThepKpwti6wGnnvZ3cV9uB5z9JLEFygYvhX876niS',
        type: 'Ed25519VerificationKey2018',
        publicKeyBase58: 'CrjJxiU8K64U5VFzdw86ygYrpm1dCJgcG4NtfadFBiZV'
      }
    ],
    created: '2021-03-08T13:20:23Z',
    updated: '2021-03-08T13:20:23Z',
    immutable: false,
    proof: {
      type: 'JcsEd25519Signature2020',
      verificationMethod: '#key',
      signatureValue: '4inXAhRn2MDsy8hiiqC438AvbVPUYUVrgc8Qa94Ns3qM3uYbfBewqMeNXitoeHM5AZCt6hKVqZJGtmTCzqDuL5hi'
    }
  });

  console.log('DOOOOOOC', identity);

  console.log('done :)');
  process.exit(0);
}

setupApi();
