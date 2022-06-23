---
image: /img/integration-services/integration_services_welcome.png
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

![Integration Services](/img/integration-services/integration_services_welcome.png)

The IOTA Integration Services implement a high-level API for common interactions with decentralized identities and Data
Streams based on the [IOTA Identity](https://wiki.iota.org/identity.rs/introduction)
and [IOTA Streams](https://wiki.iota.org/streams/welcome) libraries, facilitating the integration of IOTA into
existing digital infrastructure.

The solutions developed by the Integration Services are domain agnostic and can be applied to several use cases, ranging
from e-commerce to healthcare and beyond.

:::info Deployment

If you require a deployment of the Cloud Services please contact the team at [integrations@iota.org](mailto:integrations@iota.org)

:::

:::info Try out

For testing purposes please try our demo deployment here: 

URL: [`https://demo-integration-services.iota.cafe/`](https://demo-integration-services.iota.cafe/)

API key: `b85e51a2-9981-11ec-8770-4b8f01948e9b`

:::

## IOTA Audit Trail Gateway

The [Audit Trail Gateway](services/audit-trail-gateway/introduction.md) allows third-party entities to easily log and share immutable information, while other
authorized third parties can access this information and verify its integrity and authenticity.

## Self-Sovereign Identity(SSI) Bridge

The [Self-Sovereign Identity(SSI) Bridge](services/SSI-bridge/introduction.md) enables the creation, issuing, and verification of trusted self-sovereign
decentralized identities and credentials.

## What You Will Find

This documentation has five sections:

1. **Services**: An introduction to the main concepts, use cases, API referneces and definitions for the [Audit Trail Gateway](services/audit-trail-gateway/introduction.md) and [Self-Sovereign Identity(SSI) Bridge](services/SSI-bridge/introduction.md).
2. **Clients**: Showcase of the [Dashboard](services/dashboard/dashboard.md), [UI components](services/dashboard/ui-components.md), [CLI](is-cli/introduction.md) and examples on creating and managing decentralized identities, verifiable credentials, and channels with [Node.js](examples/node/introduction.mdx) and [Java](examples/java/introduction.mdx).
3. [Basics](basics/identity): Relevant links to guide you in learning the basics about [Identity](https://wiki.iota.org/identity.rs/introduction) and [Streams](https://wiki.iota.org/streams/welcome).
4. [Troubleshooting](troubleshooting.md): Instructions on how to resolve any issues you may encounter while using the services.
5. [FAQ](faq): Answers to the most common doubts.

## Join the Discussion

If you are looking for a place to discuss this library, or are in need of support head to
our [Discord channel](https://discord.gg/iota) `#integration-services`.

:::danger

When using the demo integration services deployment, please refrain from logging any personal data. The framework is still under development and should only be used for testing. As multiple entities can have access to this demo and its associated database, the IOTA foundation cannot be held responsible for any data logged using this deployment. If you need a dedicated and secure solution for a production-ready use case, either deploy your IS locally or please get in touch [integrations@iota.org](mailto:integrations@iota.org) so we can assist you with our dedicated expertise.

:::

:::caution Bug Reporting

Please report any bugs found whilst engaging with any part of the integration services to [integrations@iota.org](mailto:integrations@iota.org)

:::
