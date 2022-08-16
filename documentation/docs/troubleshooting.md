---
image: /img/integration-services/logo/integration_services.png
description: Troubleshoot any problems you may be having by joining our discord, creating a GitHub issue, or reviewing our Frequently Asked Questions.
keywords:
- channels
- authorize channel
- subscribe channel
- read channel
---
# Troubleshooting

The best source for sorting out problems is the IOTA [Discord](https://discord.gg/iota). Join the [#iota-cloud-tools](https://discord.com/channels/397872799483428865/910192737842790400) channel and ask your questions there. Additionally, the [FAQ](./faq) might have the answer to your problem. You can check if others are facing similar problems in the [issues](https://github.com/iotaledger/integration-services/issues) section in our repository.

Please make sure to have the latest version of the Integration Services installed and all other packages up to date.


## Breaking Changes

### SSI-Bridge v0.1 -> v0.2
With the release of the new version of the SSI-Bridge we upgrade to the latest  `identity.rs v0.6` version. The upgrade of the identity library brings some improvement but structural changes on how the identities are stored at the tangle, that's why it is not more able to decode previously stored identities anymore. This means, all identities created with the `SSI-Bridge v0.1` are no more able to be read by the `SSI-Bridge v0.2`. 

#### Create identity endpoint

The latest update also gives the opportunity to create encryption keys for the identity and store the corresponding key within its document. That's why the response of the `/api/v0.2/identities/create` endpoint has been changed. In `SSI-Bridge v0.1` the response has looked as following:

```
{
    "doc": {
        "id": "did:iota:5tkMtbJYYs63etPWFh97gkM41qFdPMxY9ADLBfi6puSj",
        "authentication": [
            {
                "id": "did:iota:5tkMtbJYYs63etPWFh97gkM41qFdPMxY9ADLBfi6puSj#key",
                "controller": "did:iota:5tkMtbJYYs63etPWFh97gkM41qFdPMxY9ADLBfi6puSj",
                "type": "Ed25519VerificationKey2018",
                "publicKeyBase58": "H3NpEmBpHWXJXWVDao4zrnpP4X679qs9BhSxLfe3J2Hp"
            }
        ],
        "created": "2022-07-27T07:46:34Z",
        "updated": "2022-07-27T07:46:34Z",
        "proof": {
            "type": "JcsEd25519Signature2020",
            "verificationMethod": "#key",
            "signatureValue": "3Z9VX6mXByjxt7d2e45H1BxLmE1dB1n48wEiYe8q6TTuGoz8JX3jZn7jaYiQBnFybeD8iNBzaDaupCLxBuytXpLw"
        }
    },
    "key": {
        "type": "ed25519",
        "public": "H3NpEmBpHWXJXWVDao4zrnpP4X679qs9BhSxLfe3J2Hp",
        "secret": "2v8bgqPiR9U6SR9EZtjj5y4XXHDTQc5sHY45Kevupyz1",
        "encoding": "base58"
    }
}
```

For `SSI-Bridge v0.2` the new response looks as following:

```
{
    "id": "did:iota:AXGjMoXRDR36YrmnFyKwXtc3sj3q7FRkzqZwhn7i67a9",
    "keys": {
        "sign": {
            "public": "9M2itnCuw62vjrsiL7M4QLWa1B9C7BYb4sBSdumT2TKd",
            "private": "8sHKprAuiTQPE8heArxeGRQmmzyv3C1hhMGUf5QmPh2b",
            "type": "ed25519",
            "encoding": "base58"
        }
        encrypt: { 
            "public": "9M2itnCuw62vjrsiL7M4QLWa1B9C7BYb4sBSdumT2TKd",
            "private": "8sHKprAuiTQPE8heArxeGRQmmzyv3C1hhMGUf5QmPh2b",
            "type": "x25519",
            "encoding": "base58"
        }
    }
}
```

Notice the `key` was renamed to `keys` since we now have an asymmetric encryption and a signature key. Instead of responding the whole document only the created identity id is returned. The document can always be fetched from the `/api/v0.2/verification/latest-document/<identity-id>` endpoint. The `secret` key was renamed to `private` to be consistent with the new identity.rs framework. In addition the data model of the identity document and verifiable credentials have been updated to the latest version. For authentication consider to use the key: `keys.sign.private` to sign the nonce but if you are using the `@iota/is-client` this will be done automatically.
