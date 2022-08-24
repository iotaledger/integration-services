import { IdentityClient, CredentialTypes, UserType } from '@iota/is-client';
import { defaultConfig, defaultManagerConfig } from './configuration';
import { writeFileSync } from 'fs';
import { Manager } from './manager';
import { UserRoles } from '@iota/is-shared-modules';

async function setup() {
  const identity = new IdentityClient(defaultConfig);

  const username = 'Admin-' + Math.ceil(Math.random() * 100000);
  const rootIdentity = await identity.create(username);

  writeFileSync('adminIdentity.json', JSON.stringify(rootIdentity, null, 2));

  const manager = new Manager(defaultManagerConfig);

  await manager.setRole(rootIdentity.id, UserRoles.Admin);

  await identity.authenticate(rootIdentity.id, rootIdentity.keys.sign.private);

  await identity.createCredential(
    undefined,
    rootIdentity?.id,
    CredentialTypes.VerifiedIdentityCredential,
    UserType.Service,
    {}
  );

  console.log('Identity created: ' + rootIdentity.id);
}

setup();
