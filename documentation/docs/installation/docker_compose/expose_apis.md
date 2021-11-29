# Expose APIs

The execution of docker-compose run database, setup job and service on the current host.

The ports `3000` and `27017` are exposed on the current host:

- `27017` is the MongoDB port: you can access to the database for development purpose from here (see `.env` for username, password and database)
- `3000` is the port that serve the Integration Service APIs

You can check if Integration Services API is up and running with the following:

```
$ curl http://localhost:3000/info
```

You can open in any browser the OpenAPI documentation for the API at this address:

[http://localhost:3000/docs](http://localhost:3000/docs)
