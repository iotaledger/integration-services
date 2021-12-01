# Docker Compose

## Prerequisite

Install the following:

* [docker](https://docs.docker.com/get-docker/)
* [docker-compose](https://docs.docker.com/compose/install/)

## Download the project

Clone the project:

```
git clone https://github.com/iotaledger/integration-services.git

cd integration-services/api
```

## Configuration

Copy `.env.example` into `.env` and `mongo-init.js.example` into `mongo-init.js`.

Replace `db-user`, `db-password`, `dn-name`, `server-secret` and `optional-api-key` in files `.env` and `mongo-init.js` accordingly.

> Important: the `server-secret` must be 32 characters length

Here an example of how a `.env` file should look like:

````javascript
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

Here an example of how a corresponding `mongo-init.js` file should look like:

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

Make sure you use the same value for the same variable inside `.env` and `mongo-init.js`

## Run Integration Services API

You can start the Integration Services API with the following:

```
$ docker-compose up --env-file .env --build
```



