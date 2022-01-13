---
image: /img/logo/integration_services.png
description: The example-4 script authenticates an Integration Service client to manage Identities using the Admin identity created in example-0 and then creates and verifies identities and credentials.
keywords:
- create identity
- create credential
- validate credential
- add trusted authority
- example
---

# Trusted Authorities

The [example-4](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/4-TrustedAuthorities.ts)
script authenticates an Integration Service client to manage Identities using the Admin identity created in [example-0](how-to-run-examples) and then performs the following tasks:

1. Create an identity with username: `Driver`.
2. Create a credential for the `Driver` identity (the root identity is a trusted authority).
3. Verify credential issued by this trusted authority.
4. Check a credential (in the Tangle) that is issued by an unknown authority (it will be not valid). 
5. Add the external issuer as trusted authority.
6. Check same credential, now issuer is trusted and the credential is valid.

You can run the example with the following command:

```bash
npm run example-4
```
