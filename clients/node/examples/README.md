# Examples

In order to work with the examples you need to copy the `.env.example` file into the `.env` file. The configuration has a section related to administration of Integration Services that will require database access (MONGO_URL, DB_NAME, SECRET_KEY) and a section to interact with the API.

An example of a configured `.env` file for a locally deployed Integration Services API is the following:

```
#-----------------------
# For management purpose
#-----------------------
MONGO_URL=mongodb://admin:admin@localhost:27017
DB_NAME=integration-service-db
SECRET_KEY=PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa

#---------------------
# Client configuration
#---------------------
API_KEY=94F5BA49-12B6-4E45-A487-BF91C442276D
API_URL=http://localhost:3000
```

## Setup

Some of the examples requires to use a trusted root identity or an identity with Admin role.

We setup such identity using the root identity generated when the API is deployed and give it the Admin role.

This is preliminary operation that need to be performed before launching some the tests:

`npm run example-0`

## Create Identity And Credentials

`npm run example-1`

In this example you authenticate yourself using the root identity to:
* create a new Identity 
* create a credential for that identity
* verify the credential generated

## Update Users

`npm run example-2`

In this example you authenticate yourself using the root identity to:
* search a user
* update its username 

## Delete Users

`npm run example-3`

In this example you authenticate yourself using the root identity to:
* create a new identity
* remove it from Integration Services
* verify that the identity still exists on the Tangle

## Trusted Authorities

`npm run example-4`

In this example you authenticate yourself using the root identity to:
* create a identity with username: `Driver`
* create a credential for the `Driver` identity (root identity is a trusted authority)
* verify credential issued by this trusted authority
* check a credential (in the Tangle) that is issued by an unknown authority (it will be not valid)
* add the external issuer as trusted authority
* check same credential: now issuer is trusted and the credential is valid 

## Create Channel

`npm run example-5`

In this example you:
* create an Identity and authenticate yourself with it
* create a channel
* write data on the channel
* read data from the channel

## Authorize Channel

`npm run example-6`

In this example you:
* create two identities: `Owner` and `User`
* you authorize each identity against Integration Services API (different clients)
* `Owner` create a channel and write data on it
* `User` try to read but fails (because it has no access)
* `User` request subscription
* `Owner` find unapproved subscription and approves it
* `User` send data to the channel
* `Owner` is able to read data (second message sent by `User`) from that channel

## Search Channel and Validate Data

`npm run example-7`

In this example you do similar to previous example (Authorize Channel) creating a channel as `Owner` and authorizing a `User` to write on it but:
* `Owner` send some data on the channel
* `User` receive data and *modify them*
* `User` validate tampered data: the API (using Tangle and data signatures) will recognize that data are not valid (i.e. signatures not match) 

