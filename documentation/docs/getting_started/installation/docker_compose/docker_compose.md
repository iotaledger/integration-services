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
    
3. Install all npm dependencies by running:

    ```bash
    npm install
    ```

## Configuration

Use the Integration Services CLI to configure the API. The CLI configures your `.env` and `mongo-init.json` files.

1. Navigate to the api folder: 

```bash
cd integration-services/api
```
2. Configure the API: 

```bash
npx @iota/is-cli setup-api
```

## Run Integration Services API

You can start the Integration Services API by running the following commands:

```bash
docker-compose build
```

```bash
docker-compose --env-file .env up --build
```



