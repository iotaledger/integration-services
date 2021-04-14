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

## 2. For local development add .env file
Copy the `./api/.env-example` and rename it to `./api/.env`

Set the correct `DATABASE_URL`, as currently seen in `docker-compose.yml` the following url (for development only) is used:

```
DATABASE_URL=mongodb://root:rootpassword@0.0.0.0:27017
```

## 3. Run the API

> Run the api using `npm run start` or `npm run serve` to watch for file changes.

Before the api is able to run, there are two steps which have to be done in advance.

1. Create a random secret and store it

To encrypt the secret key of the server identity a server secret has to be generated and stored as env variable like following:
````
SERVER_SECRET=56912342314869723452317869234123491234

````

2. Store the server identity as environment variable

The server has its own identity to sign verifiable credentials. This id of the identity is part of the .env-example: `SERVER_IDENTITY=<server-identity>`. When starting the api for the first time it will generate an identity by calling `setupApi()` function. The generated identity will be stored in the mongodb, but the id of the server must be set as environment variable which will be outputed in the console like following:
````
Setup Done!
Please store the generated server identity as environment variable.
Like: SERVER_IDENTITY=did:iota:HGz5ih7k7JkK9yCQTnR1vmuLs4vE7BNFCoigLuwCxwok
````
Store this env var in the .env or the environment variables of the deployed server.