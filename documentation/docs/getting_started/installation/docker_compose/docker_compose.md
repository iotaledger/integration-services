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
docker-compose --env-file .env up --build
```

Now you are done with the docker-compose setup. To make sure that everything works as expected read the [next section](#test-your-api) down below.

## Test your API
By following this section you can check if the installation was successful. 
### Check Container
First we want to test if all docker container started up correctly.

List all container:
```bash
docker-compose ps
```

You should be able to see all container except `api_initialize-audit-trail_1` and `api_initialize-ssi-bridge_1` in a `Up` state.

```
            Name                          Command               State                       Ports                    
---------------------------------------------------------------------------------------------------------------------
api_audit-trail-gw_1           docker-entrypoint.sh node  ...   Up                                                   
api_initialize-audit-trail_1   docker-entrypoint.sh node  ...   Exit 0                                               
api_initialize-ssi-bridge_1    docker-entrypoint.sh node  ...   Exit 0                                               
api_mongo_1                    docker-entrypoint.sh mongod      Up       0.0.0.0:27017->27017/tcp                    
api_ssi-bridge_1               docker-entrypoint.sh node  ...   Up                                                   
traefik                        /entrypoint.sh --api.insec ...   Up       0.0.0.0:3000->80/tcp, 0.0.0.0:8080->8080/tcp
```

### Check Endpoints
Now you can check if you can reach the `audit-trail-gw` and `ssi-brdige` via http by running the following commands:

```bash
curl http://localhost:3000/audit-trail-gw/info
```

```bash
curl http://localhost:3000/ssi-bridge/info
```

The API documentation for each endpoint can be found here:

- [http://localhost:3000/audit-trail-gw/docs](http://localhost:3000/audit-trail-gw/docs)

- [http://localhost:3000/ssi-bridge/docs](http://localhost:3000/ssi-bridge/docs)






