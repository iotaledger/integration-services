import { IdentityClient, IdentityJson, CredentialTypes, UserType } from '@iota/is-client';
import { defaultConfig, defaultManagerConfig } from './configuration';
import { writeFileSync } from 'fs';
import { Manager } from './manager';
import { UserRoles } from '@iota/is-shared-modules/lib/models/types/user';

async function setup() {
  const identity = new IdentityClient(defaultConfig);

  const username = 'Admin-' + Math.ceil(Math.random() * 100000);
  const rootIdentity = (await identity.create(username)) as IdentityJson;

  writeFileSync('adminIdentity.json', JSON.stringify(rootIdentity, null, 2));

  const manager = new Manager(defaultManagerConfig);

  await manager.setRole(rootIdentity.doc.id, UserRoles.Admin);

  await identity.authenticate(rootIdentity.doc.id, rootIdentity.key.secret);

  await identity.createCredential(
    undefined,
    rootIdentity?.doc?.id,
    CredentialTypes.VerifiedIdentityCredential,
    UserType.Service,
    {}
  );

  console.log('Identity created: ' + rootIdentity.doc.id);
}

setup();
