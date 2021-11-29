## Local Development

For local development you can start the main service with docker-compose (as before) and then use nodejs to run the api:
remember however to define the correct `DATABASE_URL` environment variable changing `mongo` with `localhost`.

### 1. Run MongoDB

1.1  Change the directory to the `/api` folder und use the following command: `docker-compose up -d mongodb_container` only the mongodb will be started using docker.

1.2. Check the docker container
Use `docker ps` to check whether the container is running. It should output something like:
```
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                      NAMES
eceaab9343eb   mongo:latest   "docker-entrypoint.s…"   7 seconds ago   Up 7 seconds   0.0.0.0:27017->27017/tcp   api_mongodb_1
```

> You can connect to the api via clients like `MongoDB Compass` by using the defined connection url of the database like for instance `mongodb://root:rootpassword@0.0.0.0:27017`!

### 2. Run the API

2.1. Make sure you are in the `/api` folder and use the following commands:
```
npm install     # Install dependencies
npm run keygen  # Generate root identity: output on SERVER_ENTITY file
npm run start   # Run server
```

If it was the first time the api is started, no `SERVER_IDENTITY` is defined since it was left blank previously. The api should log a newly generated identity id which needs to be used as server identity as following:

```
Successfully connected to mongodb
Create identity...
==================================================================================================
== Store this identity in the as ENV var: did:iota:BfGtLdthmzrUdgYptrZgnC4amXZBZ2C2xQMVM7Bb1cZs ==
==================================================================================================
Add server id as trusted root...
Generate key collection...
Set server identity as verified...
Setup Done!
Please store the generated server identity as environment variable.
Like: SERVER_IDENTITY=did:iota:BfGtLdthmzrUdgYptrZgnC4amXZBZ2C2xQMVM7Bb1cZs
```

2.2. Copy the `SERVER_IDENTITY` into the .env file.

2.3. Run the api again using `npm run start`

It should log that the api was started like following:
```
Started API Server on port 3000
Successfully connected to mongodb
```

## 3. Run all using Docker

3.1. Start the api

The api can also be run using docker therefor use the following command:

`docker-compose up -d`

> !! Make sure the correct ip for the mongodb is set so the docker instance of the api is able to find the mongodb instance. Normally it should be the ip of the machine instaed of 0.0.0.0 !!

If it was the first time the api is started, no `SERVER_IDENTITY` is defined since it was left blank previously. The api should log a newly generated identity id which needs to be used as server identity as following:

You can check the logs using: `docker logs api_ensuresec_api_1` or using the container id like `docker logs <container-id>` by replacing `<container-id>` with the actual id.

```
Successfully connected to mongodb
Create identity...
==================================================================================================
== Store this identity in the as ENV var: did:iota:BfGtLdthmzrUdgYptrZgnC4amXZBZ2C2xQMVM7Bb1cZs ==
==================================================================================================
Add server id as trusted root...
Generate key collection...
Set server identity as verified...
Setup Done!
Please store the generated server identity as environment variable.
Like: SERVER_IDENTITY=did:iota:BfGtLdthmzrUdgYptrZgnC4amXZBZ2C2xQMVM7Bb1cZs
```

3.2. Copy the `SERVER_IDENTITY` into the .env file.

3.3. Run the docker again using `docker-compose up -d`

The docker container should log that the api was started like following:
```
Started API Server on port 3000
Successfully connected to mongodb
```

There should be now 2 docker container available check it using: `docker ps``
```
CONTAINER ID   IMAGE               COMMAND                  CREATED         STATUS         PORTS                      NAMES
086e1549bdb3   api_ensuresec_api   "docker-entrypoint.s…"   6 seconds ago   Up 5 seconds   0.0.0.0:3000->3000/tcp     api_ensuresec_api_1
0bd35f3d5fc5   mongo:latest        "docker-entrypoint.s…"   7 seconds ago   Up 6 seconds   0.0.0.0:27017->27017/tcp   api_mongodb_container_1
```

## 4. API Key

The api supports an optional api-key which can be used to filter requests which do not know about the right key. If the key is not added or is set as an empty string the api-key won't be considered by the api. To force a check for the api-key it can be added by adding the env variable `API_KEY` to the .env file, like for instance:
```
API_KEY=SAMPLE-API-KEY
```
In this case all request must have the specified api-key as `?api-key=SAMPLE-API-KEY` query parameter like:

```
localhost:3000/api/v1/verification/latest-document/did:iota:2k7Spwr9yFfCTgGPArucUg3h89W6kidjqBBMMKMW4C9r?api-key=SAMPLE-API-KEY
```