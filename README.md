# Setup the E-Commerce Audit Log API


## 1. MongoDB

### Setup MongoDB

Start the docker container using: `docker-compose up -d` in the api folder

> Info: There are predefined connection credentials in the docker-compose.yml

Verify it is running: `docker ps`

Expected output:


```
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                      NAMES

1a3553ec3f25   mongo:latest   "docker-entrypoint.s…"   5 minutes ago   Up 4 minutes   0.0.0.0:27017->27017/tcp   api_mongodb_container_1
```
  

### Connect to MongoDB

1. Use a client to connect to the mongodb like for instance: `MongoDB Compass`
2. Use the connection url which will be defined in the following step to connect to the mongodb via `MongoDB Compass`!
    If you didn't change the docker-compose it is: `mongodb://root:rootpassword@0.0.0.0:27017`

## 2. Add .env file
Copy the `./api/.env-example` and rename it to `./api/.env`

Set the correct `DATABASE_URL`, as currently seen in `docker-compose.yml` the following url (for development only) is used:

```
DATABASE_URL=mongodb://root:rootpassword@0.0.0.0:27017
```

## 3. Create a server identity
The server has its own identity so sign verifiable credentials. This id of the identity is part of the .env-example: `SERVER_IDENTITY=<server-identity>`.

So before starting the api, you need to create a server identity. Therefor an admin tool is used which can be found at `./api/src/admin.ts`.

This can be started using: `ts-node ./api/src/admin.ts`

The tool will log the id which need to be set as SERVER_IDENTITY environment variable like following:
```
=====================================================================================================================
== Store this identity in the as ENV var as SERVER_IDENTITY: did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk ==
=====================================================================================================================
```

So replace the `SERVER_IDENTITY=<server-identity>` of the __.env__ file with the logged id starting at did like: 

```
SERVER_IDENTITY=did:iota:BfaKRQcBB5G6Kdg7w7HESaVhJfJcQFgg3VSijaWULDwk
```


## 4. Run the API

Run the api using `npm run start` or `npm run serve` to watch for file changes.