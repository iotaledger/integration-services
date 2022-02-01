# Ecommerce-SSI Bridge

## Concept and logic architecture
---

The Ecommerce-SSI Bridge allows users to create Self-Sovereign Identities, linking Decentralized Identifiers (DIDs) to their specification ([DID Documents](https://www.w3.org/TR/did-core/)). DIDs are public/private key pairs and can be created for organizations, individuals and objects. Each identity is represented by a unique public key immutably stored onto the ledger (in our case the IOTA Tangle). Identities and public keys are used to anchor off-chain Verifiable Credentials ([VCs](https://www.w3.org/TR/vc-data-model/)), certificates containing identity attributes and signed by an Issuer identity (using its private key).

The Issuer itself is an entity with its own decentralized identity. The Bridge allows an identified trust root to verify users identity. Verified identities can then propagate this verification to other entities (organizations, individuals, objects) identity using a network of trust approach (see figure below).

![network-of-trust](./assets/arch/network-of-trust.jpeg)


The Bridge also allows Issuers to issue Verifiable Credentials for selected identity Owners (identified by a decentralized identity) and Owners to present them to Verifiers. Verifiers can use the Ecommerce-SSI Bridge APIs to verify credentials authenticity. This requires verifying that a credential contains the identifier (DID) of the owner presenting it, and it is signed by an authorised Issuer. This requires accessing the information stored onto a ledger.

The image below shows the interaction between Issuer, Owner, Verifier and the ledger to manage the lifecycle of decentralized identities and verifiable credentials.


<img width="742" alt="Screenshot 2021-05-21 at 22 21 11" src="https://user-images.githubusercontent.com/1702827/119199429-ef67bc80-ba82-11eb-8d74-c92f5bc66717.png">


The IOTA Ecommerce-SSI Bridge provides an abstraction layer through REST APIs that allows entities to create decentralized identities (DIDs), verify them, attach verifiable credentials and verify them.

The figure below shows the envisioned system architecture (within the full set of IOTA Integration Services developed for the ENSURESEC project).
![IOTA-Tools-Architecture](https://user-images.githubusercontent.com/1702827/119853084-c5d9e580-bf07-11eb-9cac-9aab23d7123a.png)

Below we provide examples on how the Bridge could be used in the context of e-commerce ecosystems, in particular: 1) secure goods distribution and 2) secure sales.


## Software Architecture and APIs Definition
---
The software and services architecture and the list of provided APIs are shown in the figure below.

![ecommerce-ssi-bridge](./assets/diagrams/ecommerce-ssi-bridge.jpeg)


### Identity Service 
The service allows to create decentralized identity onto the IOTA Tangle and to locally manage information for their indexing and search. This service is provided centrally for ease of use but in production ready scenario it is recommended to be installed locally.

__Prefix:__ `/api/{{version}}/identities`


### Authentication Service 
The service allows previously created identies to be authenticated and authorized to use the Bridge. This is required to maintain the security of the Bridge and audit its use, but it can be removed in case the Bridge is deployed locally to each party.

__Prefix:__ `/api/{{version}}/authentication`

### Verification Service
The service allows to verify identities, create and verify credentials. This is the abstraction layer that allows every entity to easily deal with IOTA decentralized (SSI) identity implementation. 

__Prefix:__ `/api/{{version}}/verification`


## Use cases
---
### Secure goods distribution
#### Use case 1. Delivery company identity and scanners verification

__Problem__: Protection of Delivery: avoid goods being handled by unauthorised carriers; avoid threats and frauds in the distribution chain. 

In the context of ENSURESEC e-commerce ecosystem, the proposed use case will make use of the Ecommerce-SSI Bridge to implement the following workflow:
* An authorised employee of a delivery company X registers an identity (DID) for their organization using the Ecommerce-SSI Bridge;
* An e-commerce operator verifies the delivery company organization identity and uses the Bridge to issue a credential for the company to deliver on their behalf. The credential contains the company organization DID and it is signed by the e-commerce operator private key (associated to its identity; previously established);
* The authorised employee of the verified delivery company registers a DID for each scanner (i.e. android scanners) used by the company couriers;
* The authorised employee uses the Ecommerce-SSI Bridge to issue authorisation credentials to the scanner devices used to handling deliveries (with such credentials stored locally into the scanner devices);
* When a courier hands over the delivery, the scanner device uses the Ecommerce-SSI Bridge to present its credential to the e-commerce operator;
* The e-commerce operator uses the Ecommerce-SSI Bridge to verify that the parcel was handled by an authorised courier and device and not stolen or diverted in transit. This is possible because of the verification of the device handling the scanning of the delivery;
* (optionally) The customer can acquire the courier scanner device credential (in the form of a QR code read through her mobile phone) and use the Ecommerce-SSI Bridge to verify that the scanner device belongs to a delivery company authorised by her e-commerce operator. This allows to verify authentic deliveries.


#### Use case 2. Customer identity and delivery verification

__Problem__: Proof of Collection: guarantee goods being collected by the right customer; avoid threats and frauds in the distribution chain. 

In the context of ENSURESEC e-commerce ecosystem, the proposed use case will make use of the Ecommerce-SSI Bridge to implement the following workflow:
* A customer creates a decentralized identity (DID) using a mobile application (a standalone credential wallet or an e-commerce shopping app);
* The customer performs a purchase on an e-commerce site (see below use case 2 in case of age verification is required);
* The e-commerce site uses the Ecommerce-SSI Bridge to issue a proof of purchase credential to the customer (this is saved to the customer phone);
* The customer receives the product delivery and present the credential in the form af a QR code to the courier scanner;
* The courier acquires the credential and uses the Ecommerce-Bridge to verify its authenticity; the delivery is safely handled over to the right customer;
* (optionally) The customer acquires the courier scanner credential (see above, use case 1) and uses the Ecommerce-SSI Bridge to verify that it belongs to an authorised delivery company; the customer knows the delivery is legit.

_The two scenarios above become even more interesting in case of automated (i.e., drones) delivery. And when including also product identification._

### Secure e-commerce sales
#### Use case 1. Customer identity and credential (age) verification

__Problem__: Verify customer identity and avoid to collect and store personal information; increasing compliance and reducing liability for e-commerce and small sellers.

In the context of ENSURESEC e-commerce ecosystem, the proposed use case will make use of the Ecommerce-SSI Bridge to implement the following workflow:
* An authorised bank employee registers an _organization_ decentralized identity (DID) for its bank;
* A customer creates a decentralized identity (DID) using a mobile application (a standalone credential wallet or an e-commerce shopping app);
* The customer requests an Issuer (e.g., the bank) to issue a credential staying her age;
* The issuer uses information about the user held on local record (and previously verified) and the Ecommerce-SSI Bridge to create and issue a Verifiable Credential to the customer;
* The customer (namely Owner) downloads the credential in her app, using a credential wallet;
* The customer purchases an item that requires age verification on an e-commerce site;
* The customer provides her credential to the e-commerce website using the Ecommerce-SSI Bridge;
* The e-commerce site uses the Ecommerce-SSI Bridge to verify the credential and authorise the purchase.

_A similar scenarion can be applied in case of online purchase of dedicated drugs for specific health condition. The customer can be issued with a credential from her GP statying her condition._


#### Use case 2. Seller identity verification 

__Problem__: Verify sellers identity; reducing small sellers compliance burden and reputation risks.

In the context of ENSURESEC e-commerce ecosystem, the proposed use case will make use of the Ecommerce-SSI Bridge to implement the following workflow:
* An e-commerce site allows a seller authorised employee to create a decentralized identity (DID for organization) using the Ecommerce-SSI Bridge;
* The seller requests an Issuer (e.g., its bank) to issue a credential stating its KYC (Know Your Customer) status;
* The seller presents the credentials to the e-commerce site operator using the Ecommerce-SSI Bridge;
* The e-commerce site operator verifies the seller credentials using the Ecommerce-SSI Bridge and allow the seller to trade on its marketplace

#### Use case 3. Product identity and authenticity

__Problem__: Verify product authenticity; reducing counterfeit.

In the context of ENSURESEC e-commerce ecosystem, the proposed use case will make use of the Ecommerce-SSI Bridge to implement the following workflow:
* The e-commerce site allows the seller to create a decentralized identity for each of its products (DID for objects) using the Ecommerce-SSI Bridge;
* The e-commerce site allows the seller to create and sign an authenticity credential associated to a given product identity using the Ecommerce-SSI Bridge;
* A user app allows a customer to obtain the product authenticity credential (scanning a QR from an e-commerce site or directly attached to a purchased product);
* A user app allows a customer to verify signature of the product authenticity credential using the Ecommerce-SSI Bridge (thus allowing verification of the seller identity).
