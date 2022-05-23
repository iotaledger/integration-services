# Changelog

### v0.1.4 -> v0.1.5

##### Non breaking changes:

- Adjust the `/history` endpoint to also support public channels
- Add history UI to the dashboard

### v0.1.3 -> v0.1.4

##### Non breaking changes:

- User interface (dashboard) to manage identities, credentials and channels
- Split code base into `ssi-bridge` and `audit-trail-gw`
- Audit trail gateway is now independent of ssi-bridge
- API gateway for the micro services and dashboard
- A channel can now have a `name` and a `description`
- Identity chaining via `creator` field
- Enhanced search for channel-info and identities
- New endpoint: `/authentication/verify-jwt` to check whether a JWT is valid and signed by the IS
- New guides to the wiki

### v0.1.2 -> v0.1.3

##### Breaking changes:
- Rename `identityId` to `id`
- Rename `identity-docs` collection to `identity-keys`
- Adjust data model of the `identity-docs` collection
 
#### __Use the migration script linked [here](./MIGRATION.md) to migrate the database and stored data models.__

##### Non breaking changes:
- Add wiki with detailed examples
- NodeJs client sdk
- Add several security features
- Made API easier to scale by adding Kubernetes
- Improve setup scripts
- Dependencies upgrades

