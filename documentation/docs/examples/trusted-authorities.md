# Trusted Authorities

The [example-4](https://github.com/iotaledger/integration-services/blob/develop/clients/node/examples/4-TrustedAuthorities.ts)
script authenticates a Integration Service client to manage Identities using the Admin identity created in [example-0](./how-to-run-examples) and then performs the following tasks:

* create a identity with username: `Driver`
* create a credential for the `Driver` identity (root identity is a trusted authority)
* verify credential issued by this trusted authority
* check a credential (in the Tangle) that is issued by an unknown authority (it will be not valid)
* add the external issuer as trusted authority
* check same credential: now issuer is trusted and the credential is valid 

You can run the example with the following:

```bash
npm run example-4
```

