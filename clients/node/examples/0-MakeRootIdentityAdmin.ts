import { Manager, UserRoles, IdentityClient, IdentityJson, CredentialTypes, UserType } from 'iota-is-sdk';
import { defaultConfig, defaultManagerConfig } from './configuration';
import { writeFileSync } from 'fs';

async function setup() {

    const identity = new IdentityClient(defaultConfig);

    const rootIdentity = await identity.create('User') as IdentityJson;

    writeFileSync("adminIdentity.json", JSON.stringify(rootIdentity, null, 2));

    const manager = new Manager(defaultManagerConfig);

    await manager.setRole(rootIdentity.doc.id, UserRoles.Admin);

    await manager.close();

    await identity.authenticate(rootIdentity.doc.id, rootIdentity.key.secret);

    await identity.createCredential(
        undefined,
        rootIdentity?.doc?.id,
        CredentialTypes.VerifiedIdentityCredential,
        UserType.Service,
        {}
    );

    console.log("Identity created: " + rootIdentity.doc.id)

}

setup();