---
image: /img/integration-services/logo/integration_services.png
description: This section will guide in setting up the Integration Service API using Docker Compose.
keywords:
- docker compose
- setup API
- configure
- mongo-init.js
- .env
---

# Local Setup

This section will guide in setting up the Integration Service API using Docker Compose.

## Requirements

Please make sure to have the following installed before moving forward:

* [docker](https://docs.docker.com/get-docker/)
* [docker-compose](https://docs.docker.com/compose/install/)

## Download the Project

1. Clone the project by running the following command:

    ```bash
    git clone https://github.com/iotaledger/integration-services.git
    ```

2. Change directory into the `api` folder in your freshly cloned project by running:

    ```bash
    cd integration-services/api
    ```

## Configuration

If this is your first time installing the project, please make a copy of
the [.env.example file](https://github.com/iotaledger/integration-services/blob/master/api/.env.example) and rename it
as `.env`, and also copy
the [mongo-init.js.example file](https://github.com/iotaledger/integration-services/blob/master/api/mongo-init.js.example)
and rename it as `mongo-init.js`.

After you have done this, replace `db-user`, `db-password`, `dn-name`, `server-secret` and `optional-api-key` in the
newly created `.env` and `mongo-init.js` files accordingly.

:::danger
Important The `server-secret` must be 32 characters length
:::


:::tip You can create a server secret using the following command 
```
npm run generate-secret
```
:::

Here is an example of how a `.env` file should look like:

````dotenv
PORT=3000
IOTA_PERMA_NODE=https://chrysalis-chronicle.iota.org/api/mainnet/
IOTA_HORNET_NODE=https://chrysalis-nodes.iota.org:443

DATABASE_NAME=integration-services
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=rootpassword
DATABASE_URL=mongodb://root:rootpassword@mongo:27017

SERVER_SECRET=PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa
API_KEY=94F5BA49-12A6-4E45-A487-BF91C442276D
````

Here is an example of how a corresponding `mongo-init.js` file should look like:

````javascript
db.createUser(
    {
        user: "root",
        pwd: "rootpassword",
        roles: [
            {
                role: "readWrite",
                db: "integration-services"
            }
        ]
    }
);
````

:::note
Make sure that you use the same value for the same variables inside `.env` and `mongo-init.js`
:::

## Run Integration Services API

You can start the Integration Services API by running the following command:

```bash
docker-compose --env-file .env up --build
```



