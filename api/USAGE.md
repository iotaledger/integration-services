# Usage of the IOTA Identity SSI Bridge

## Create and verify an identity

In order to interact with other users in a trusted way there are two major calls to be done which are described in the section 1 & 2.

1. Create identity

The creation of an identity is one of the key aspects when interacting with other users. By creating an identity, it creates a public/private key pair which is used to verify that the identity belongs to a specific user which is able to proof so. Furthermore it is possible to add several information about this identity like a name or to which company the user belongs. Currently the SSI Bridge supports five data models: Device, Person, Organization, Service and Product. These are types which will be validated and belong mainly on the data models of https://schema.org. In addition it is possible to define custom types since there could be use cases with different data types we do not support. The type of a user is defined by the type field of a user if it is a custom type which is not known by the api it won't be validated.

The following demonstrates an example where an identity for a device will be created. Since schema.org does not have a data model for devices the device data model of FIWARE is used.


https://ensuresec.solutions.iota.org/api/v1/authentication/create-identity

Body of the POST request:
```
{
 "username": "device-of-iota",
 "type":"Device",
 "organization": "did:iota:123456rvEeXD8z6qqd1QyYNQ1QD54fXfLs6uGew3DeNu",
 "data": {
       "id": "device-9845A",
       "category": ["sensor"],
       "controlledProperty": ["fillingLevel","temperature"],
       "controlledAsset":["wastecontainer-Osuna-100"],
       "ipAddress": ["192.14.56.78"],
       "mcc": "214",
       "mnc": "07",
       "batteryLevel": 0.75,
       "serialNumber": "9845A",
       "refDeviceModel":"myDevice-wastecontainer-sensor-345",
       "rssi": 0.86,
       "value": "l=0.22;t=21.2",
       "deviceState": "ok",
       "dateFirstUsed": "2014-09-11T11:00:00Z",
       "owner": ["http://person.org/leon"]
  }
}
```

The request returns the following body:

```
{
   "doc": {
       "id": "did:iota:FuqjNydC3pKo46M6Dprks3UDuqRhaiCQiLshTfW8V8nN",
       "authentication": [
           {
               "id": "did:iota:FuqjNydC3pKo46M6Dprks3UDuqRhaiCQiLshTfW8V8nN#key",
               "controller": "did:iota:FuqjNydC3pKo46M6Dprks3UDuqRhaiCQiLshTfW8V8nN",
               "type": "Ed25519VerificationKey2018",
               "publicKeyBase58": "GV1PfKbJfprUBXkXkcgVNr4P9RKMWdb5XQLGwrzgJEZy"
           }
       ],
       "created": "2021-05-19T08:33:11Z",
       "updated": "2021-05-19T08:33:11Z",
       "proof": {
           "type": "JcsEd25519Signature2020",
           "verificationMethod": "#key",
           "signatureValue": "39BjT8Lbz57HG8DTdrmDstdprD3f3ZQAPybK5dCRZ3XVgrhPW9yCvoESSPRKxLFUCJRxRR6Dr6ZQZRcVTbi3Mpcc"
       }
   },
   "key": {
       "type": "ed25519",
       "public": "GV1PfKbJfprUBXkXkcgVNr4P9RKMWdb5XQLGwrzgJEZy",
       "secret": "6CauaVFj951FWjpZ7xDCNttzWzx5bvxzYoWPDQVjrCYW",
       "encoding": "base58"
   },
   "txHash": "9908423a125ebf14e6a5aaca957f3d455c058c5b00a07c1ca77948fd5dee4365"
}
```

This key of the body is the essential part which must be stored by the client, since it contains the public/private key pair which is used to authenticate at the api.

2. Verify user

Everyone can create an identity and use any data he wants to, that is why it is needed to know if the person or device really belongs to the company it is claiming to be. Hence an identity must be verified, this can be done by an administrator of the ssi bridge or an already verified user of an organization. The verification creates a so called verifiable credential, which contains information about the user and a signature proof of the information, so the data of the verifiable credential can not be changed later but verified.

The endpoint of this request is as following:

https://ensuresec.solutions.iota.org/api/v1/authentication/verify-user

The body must contain the userId of the identity which needs to be verified in the `subjectId` field. Furthermore if the user is not an administrator he needs to add a verifiable credential which was generated when verifying him. This verifiable credential is stored by the api and can be requested at the user api. How to request the verifiable credential at the api will be described in section 3. As pointed, the verifiable credential must be part of the request if it is not a request by an admin. Add the verifiable credential in the `initiatorVC` field since it is the initiator which verifies a user. The request could look like the following:

```

```




3. Get user data



https://ensuresec.solutions.iota.org/api/v1/users/user/did:iota:8t26z2NSKz8nCoc5Z8JyEFbukBuMp3Ex5QAAnX5XBpEk

```
{
    "userId": "did:iota:8t26z2NSKz8nCoc5Z8JyEFbukBuMp3Ex5QAAnX5XBpEk",
    "publicKey": "9LxE4tqAAY8fF2hb7QPjwtqQ9j7WDenvHncihnvmEJfu",
    "username": "test-device",
    "type": "Device",
    "registrationDate": "2021-05-12T15:14:19+02:00",
    "verification": {
        "verified": true,
        "verificationDate": "2021-05-12T15:14:24+02:00",
        "lastTimeChecked": "2021-05-12T15:14:24+02:00",
        "verificationIssuerId": "did:iota:2k7Spwr9yFfCTgGPArucUg3h89W6kidjqBBMMKMW4C9r"
    },
    "organization": "IOTA",
    "data": {
        "id": "device-9845A",
        "type": "Device",
        "category": [
            "sensor"
        ],
        "controlledProperty": [
            "fillingLevel",
            "temperature"
        ],
        "controlledAsset": [
            "wastecontainer-Osuna-100"
        ],
        "ipAddress": [
            "192.14.56.78"
        ],
        "mcc": "214",
        "mnc": "07",
        "batteryLevel": 0.75,
        "serialNumber": "9845A",
        "refDeviceModel": "myDevice-wastecontainer-sensor-345",
        "rssi": 0.86,
        "value": "l=0.22;t=21.2",
        "deviceState": "ok",
        "dateFirstUsed": "2014-09-11T11:00:00Z",
        "owner": [
            "http://person.org/leon"
        ]
    },
    "verifiableCredentials": [
        {
            "@context": "https://www.w3.org/2018/credentials/v1",
            "id": "did:iota:8t26z2NSKz8nCoc5Z8JyEFbukBuMp3Ex5QAAnX5XBpEk",
            "type": [
                "VerifiableCredential",
                "DeviceCredential"
            ],
            "credentialSubject": {
                "id": "did:iota:8t26z2NSKz8nCoc5Z8JyEFbukBuMp3Ex5QAAnX5XBpEk",
                "@context": [
                    "https://smartdatamodels.org/context.jsonld"
                ],
                "batteryLevel": 0.75,
                "category": [
                    "sensor"
                ],
                "controlledAsset": [
                    "wastecontainer-Osuna-100"
                ],
                "controlledProperty": [
                    "fillingLevel",
                    "temperature"
                ],
                "dateFirstUsed": "2014-09-11T11:00:00Z",
                "deviceState": "ok",
                "initiatorId": "did:iota:5Esfk9YHpqZAGFBCh4EzbnVH2kQhirmxQApc1ghCncGQ",
                "ipAddress": [
                    "192.14.56.78"
                ],
                "mcc": "214",
                "mnc": "07",
                "organization": "IOTA",
                "owner": [
                    "http://person.org/leon"
                ],
                "refDeviceModel": "myDevice-wastecontainer-sensor-345",
                "registrationDate": "2021-05-12T15:14:19+02:00",
                "rssi": 0.86,
                "serialNumber": "9845A",
                "type": "Device",
                "value": "l=0.22;t=21.2"
            },
            "issuer": "did:iota:2k7Spwr9yFfCTgGPArucUg3h89W6kidjqBBMMKMW4C9r",
            "issuanceDate": "2021-05-12T13:14:23Z",
            "proof": {
                "type": "MerkleKeySignature2021",
                "verificationMethod": "#key-collection",
                "signatureValue": "SIGNATUREVALUE"
            }
        }
    ],
    "role": "User"
}
```

A user can have several verifiable credentials which can also be revoked when verifying another user it is needed that the verifiable credential is valid. This can be checked at the following endpoint: