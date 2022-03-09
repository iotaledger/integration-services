---
image: /img/integration-services/logo/integration_services.png
description: When you execute docker-compose it will run a database, setup job and service on the current host. The ports `3000` and `27017` will be exposed on the current host.
keywords:
- expose API
- exposed ports
- configure
- mongodb port
- integration services apis
---

# Expose APIs

When you execute docker-compose it will run a database, setup job and service on the current host.

The ports `3000` and `27017` will be exposed on the current host:

- `27017` is the MongoDB port: You can use it to access to the database for development purpose using the username,
  password, and database you configured in your `.env` file.
- `3000` is the port that will serve the Integration Service APIs.

You can check if Integration Services API is up and running by running the following command:

```bash
curl http://localhost:3000/info
```

You can open in the OpenAPI documentation for the API at this address using your browser of choice:

[http://localhost:3000/docs](http://localhost:3000/docs)
