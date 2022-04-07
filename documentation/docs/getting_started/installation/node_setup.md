---
image: /img/integration-services/logo/integration_services.png
description: This section will guide in setting up the Integration Service API using Node.js.
keywords:
- nodejs
- setup API
- configure
- .env
---

# Local Setup

This section will guide in setting up the Integration Service API using Node.js. It is mainly relevant for developers who want to contribute to the project or create a project fork.

## Requirements

Please make sure to have the following installed before moving forward:

* [node.js](https://nodejs.org/) min. v15.6.0
* [docker](https://docs.docker.com/get-docker/)
* [docker-compose](https://docs.docker.com/compose/install/)

## Download the Project

Clone the project by running the following command:

```bash
git clone https://github.com/iotaledger/integration-services.git
```

## Configure API

Use the Integration Services CLI to configure the API. The CLI configures your `.env` and `mongo-init.json` files.

1. Navigate to the api folder: 

```bash
cd integration-services/api
```
2. Configure the API: 

```bash
npx @iota/is-cli setup-api
```

### Start the MongoDB

Now you can start docker-compose in the same `/api` directory to setup your mongo database.

```
docker-compose up -d mongo
```

This must only be run once to start the MongoDB you can always check if the MongoDB container is running by running `docker ps` which should generate a similar output as:

```
CONTAINER ID   IMAGE         COMMAND                  CREATED        STATUS       PORTS                                              NAMES
f15ab2571369   mongo:latest  "docker-entrypoint.s…"   7 weeks ago    Up 7 weeks   0.0.0.0:27017->27017/tcp, :::27017->27017/tcp      api_mongo_1
```

### Setup SSI-Bridge

1. Move into the folder `ssi-bridge`.
2. Run the following commands to install dependencies, build the project, set up the API, and finally start the SSI-Bridge:

```bash
npm run setup-api
```

```bash
npm run start
```

4. You can check if the service is running with the following command:

```bash
curl http://localhost:3001/info
```

### Set up the Audit-Trail Gateway

1. Move into the folder `audit-trail-gw`.
2.  Run the following commands to install dependencies, build the project, set up the API, and finally start the Audit-Trail Gateway:

```bash
npm run setup-api
```

```bash
npm run start
```

4. You can check if the service is running with the following command:

```bash
curl http://localhost:3002/info
```