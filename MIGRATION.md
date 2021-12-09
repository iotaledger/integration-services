# Migration

> #### HowTo
> For Data Migrations it is recommended to use __Robo 3T__ which let's you easily update several documents by inserting shell commands for each collection.

____

## Data Migration from 0.1.2 -> 0.1.3

In Version __0.1.3__ the data model was modified, in fact __identityId__ was renamed to __id__. Existing data and requests must be adjusted to support this data model.

For the database migration there are two scripts which can be found in the following:

◈ [Link to the Robo3T Migration Script](./api/assets/migrations/data-migration-0.1.3.js) ◈

You can also run the following TypeScript tool to migrate the database. Make sure you've set the correct __DATABASE_URL__ and __DATABASE_NAME__ in the __.env__ file.

◈ [Link to the TypeScript Migration](./api/src/tools/migration/migration-to-0.1.3.ts) ◈

Run it by using: 

```ts-node src/tools/migration/migration-to-0.1.3.ts```

---

