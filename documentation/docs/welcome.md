---
image: ../static/img/integration-services/integration_services_welcome.png
description: The IOTA Integration Services implement a high-level API for common interactions with decentralized identities and Data Streams.
keywords:
- integration services
- decentralized identity
- streams
- use cases
- audit trail gateway
- Self-Sovereign Identity Bridge
---
# Welcome

![Integration Services](../static/img/integration-services/integration_services_welcome.png)

The IOTA Integration Services implement a high-level API for common interactions with decentralized identities and Data
Streams based on the [IOTA Identity](https://wiki.iota.org/identity.rs/introduction)
and [IOTA Streams](https://wiki.iota.org/streams/welcome) libraries, facilitating the integration of IOTA into
existing digital infrastructure.

The solutions developed by the Integration Services are domain agnostic and can be applied to several use cases, ranging
from e-commerce to healthcare and beyond.

## IOTA Audit Trail Gateway

The [Audit Trail Gateway](services/audit-trail-gateway/introduction.md) allows third-party entities to easily log and share immutable information, while other
authorized third parties can access this information and verify its integrity and authenticity.

## Self-Sovereign Identity(SSI) Bridge

The [Self-Sovereign Identity(SSI) Bridge](services/SSI-bridge/introduction.md) enables the creation, issuing, and verification of trusted self-sovereign
decentralized identities and credentials.

## What You Will Find

This documentation has eight sections.

1. [Getting started](getting_started/overview): All the resources you need to get started.
2. **Services**: An introduction to the main concepts, use cases and API definitions for the [Audit Trail Gateway](services/audit-trail-gateway/introduction.md) and [Self-Sovereign Identity(SSI) Bridge](services/SSI-bridge/introduction.md).
3. [Examples](examples/introduction): Examples on creating and managing decentralized identities, verifiable
   credentials, and channels.
4. [Basics](basics/identity): Relevant links to guide you in learning the basics about [Identity](https://wiki.iota.org/identity.rs/introduction) and [Streams](https://wiki.iota.org/streams/welcome).
5. [API Reference](api_reference): Detailed specification of all endpoints.
6. [Troubleshooting](troubleshooting.md): Instructions on how to resolve any issues you may encounter while using the services.
7. [FAQ](faq): Answers to the most common doubts.
8. [Contribute](contribute): Find ways to help the project.
9. [Contact](contact): Get in touch with the Integration Services team.

## Join the Discussion

If you are looking for a place to discuss this library, or are in need of support head to
our [Discord channel](https://discord.gg/iota) #integration-services.

:::caution

When using the demo integration services deployment, please refrain from logging any personal data. The framework is still under development and should only be used for testing. As multiple entities can have access to this demo and its associated database, the IOTA foundation cannot be held responsible for any data logged using this deployment. If you need a dedicated and secure solution for a production-ready use case, either deploy your IS locally or please get in touch [integrations@iota.org](mailto:integrations@iota.org) so we can assist you with our dedicated expertise.

:::