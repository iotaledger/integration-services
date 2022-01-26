---
image: /img/integration-services/logo/integration_services.png
description: This section will guide in setting up the Integration Service API using NodeJs.
keywords:
- nodejs
- setup API
- configure
- .env
---

# Local Setup

This section will guide in setting up the Integration Service API using NodeJs.

## Requirements

Please make sure to have the following installed before moving forward:

* [node.js](https://nodejs.org/)

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

After you have done this, replace `db-user`, `db-password`, `dn-name`, `server-secret` and `optional-api-key` in the
newly created `.env` and `mongo-init.js` files accordingly.

:::danger
Important The `server-secret` must be 32 characters length
:::

> You can create a server-secret using the following command:
> ```
> npm run generate-secret
>```

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



## Setup Integration Services API

The setup will install all external dependencies and build the service. If you are starting the API for the first time, you should run `setup-api` to set up a root identity for the service and the database. 

```
npm install
npm run build
npm run setup-api
```
## Run Integration Services API

After you ran the setup you can use the following command to start the api:

```
npm run start
```



