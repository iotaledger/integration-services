---
image: /img/integration-services/logo/integration_services.png
description: The dashboard is part of the Integration Services Suite and enables management of identities and streams.  
keywords:
- how to
- ecommerce
- dashboard
- ui
- credentials
- decentralized identity
- streams
- verify credential
---

# Dashboard

The Integration Services also includes a dashboard to view and manage all your identities, credentials and streams. The dashboard support nearly every feature currently supported by the Audit Trail Gateway and SSI Bridge APIs. You can run the dashboard directly with the `npm run dev` script in the `./dashboard` directory. The dashboard gets automatically deployed if you chosen to install the Integration Services by docker-compose or Kubernetes.

## Login and Registration 

This is the first page visible after opening the dashboard. An already created decentralized identity can be used to login. If no identity was created yet a new one can be registered by clicking on the *log in with DID* link.
![Login-Screen](/img/integration-services/dashboard/login.gif)

A new DID can be registered on this page. Depending on the identity template you select in the first dropdown different fields will be shown. A username, first name and last name are mandatory for creating a new DID with the Person template.
![Register-Screen](/img/integration-services/dashboard/register.gif)

## Identity Management

Identities can be managed in the *Identities* tab. Here you can search for identities by name or ID. New identities can be created. The most important information is directly visible in the table. Detailed information about each identity can be viewed by clicking on the table entries.
![Identities-Screen](/img/integration-services/dashboard/identities.png)

This is the detail page of the root identity. The identity claim and all credential attached to the identity can be viewed. Here you can also create, revoke and download verifiable credentials if you have sufficient permissions.
![Identities-Detail-Screen](/img/integration-services/dashboard/identity_detail.png)

## Steam Management
This tab is for managing streams. You can search for streams by stream address or topic source. Additionally you can create new streams. The table shows if you are the author or a subscriber of the listed stream. A detail view of the stream can be opened by clicking on the list entries.
![Streams-Screen](/img/integration-services/dashboard/streams.png)

The detail view of a stream shows meta information, authorized subscribers and pending subscribers. Pending subscribers can be authorized with just the click of a button. Furthermore while you are on the detail page, it is polling for new data on the stream in a predefined interval. If you are the author of a stream or got write permissions you can add new messages to the stream here.
![Streams-Detail-Screen](/img/integration-services/dashboard/stream_detail.png)
## Channel History
In the channel history tab you can fetch the whole history of a stream directly from the Tangle. For encrypted streams a preshared key is needed. For reading public streams you don't have to be subscribed.
![Channel-History-Screen](/img/integration-services/dashboard/channel_history.png)
## Verify Credential
In this tab you can upload verifiable credentials in a .json format to verify them. The verification result will be shown to you.
![Verify-Credential-Screen](/img/integration-services/dashboard/verify_credential.png)