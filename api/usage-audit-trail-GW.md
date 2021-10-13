# Ecommerce-Audit Trail Gateway (GW)

The Ecommerce-Audit Trail Gateway allows users to create immutable data channels and share them with others. Channels data are stored onto the IOTA Tangle. A channels is implemented as IOTA Stream and can handle different Subscribers. <!-- really we call everything subscriber? --> <!-- these are the terms used by iota streams -->By requesting a subscription to a channel a so called subscriber can request `Read`, `Write`, `ReadAndWrite` access to the channel. This request must then be authorized by the creator (Author) of the channel. After a subscriber is authorized, it is then able to write/read to/from the channel. In addition to subscribers, the author can always read and write messages in the channel.

> __Important:__ In order to identify and authorise subscribers (being these individuals, organizations or objects), the Audit Trail GW currently integrates with the [Ecommerce-SSI bridge](./usage-ssi-bridge.md). __This means, everyone interacting with the audit trail needs to create its own identity before.__ See the corresponding documentation. The figure below shows a logic architecure with the integration of both IOTA Integration Services.
 
![IOTA-Tools-Architecture](https://user-images.githubusercontent.com/1702827/119853084-c5d9e580-bf07-11eb-9cac-9aab23d7123a.png)

In case of the Audit Trail and the GW being deployed in presence of other (centralized) Accounting, Athentication and Authorization (AAA) systems this dependency will be removed (implementation will be provided during the project course).

## Use Cases 
There are two scenarios in which the Audit Trail can be used in the context of e-commerce and the ENSURESEC project.

### 1. _Sharing immutable and auditable data/events._ 
This includes small amount of data that a channel Author and writer subscribers want to share with reader subscribers. All information is contained into the Audit Trail and its source (identity of the writer subscribers) can be verified. An example includes _sharing of threats information_ detected by a sensor on a critical e-commerce infrastructure and shared to alert all other systems connected to the same infrastructure.

The following workflow can be implemented:
* We assume a Company X identity has been registered and verified (see Ecommerce-SSI Bridge documentation); in addition an identity for employee Y and device (sensor) Z of Company X have also been registered and verified;
* In addition a Company A identity has been registered and verified, as well as the identity of an employee B and tool C of Company A have been registered and verified;
* The device Z uses the GW APIs to create a channel _a_;
* The tool C uses the GW APIs to search for channel (based on available indexing metadata) and to request subscription to the selected channel _a_;
* The device Z uses the GW APIs to authorize tool C to access the channel _a_ as reader;
* The device Z uses the GW APIs to add data to a channel _a_;
* The tool C is automatically notified of new data coming from device Z. <!-- not sure about this, I need to check-->

<!-- are we using credentials to check authorization? How do we implement specific access policies -->
<!-- access to a stream will be handled by streams -->
### 2. _Guaranteeing the immutability of large data sets._ 
This includes storing and sharing across organizations data sets maintained in large data lakes while guaranteeing that the data sets have not been altered over time or when passing across different parties. In this case Author and writer subscribers of a channel first index the data sets, then hash them and store the hash in the Audit Trail (using the GW APIs) on a channel registered with the created index and data set metadata. Authorised reader subscribers will receive the given data set and its index/metadata and will use them to retrieve and subscribed to the requested channel. Then they can compare the hash stored in the Audit Trail with the one generated from the received data set. 

An example of this includes storing on the Audit Trail hashes of data logs collected by e-commerce systems. This allows to perform forensic investigation in case of cyberphysical attacks to e-commerce infrastructure and to detect any tampering with such logs.

A similar workflow in the previous scenario can be implemented here. The exchange of data sets and the extraction of hash/their comparison shall be implemented by the client using the Audit Trail GW APIs.

<!-- in a second version and for the deliverable; I will write the above as workflow -->

## Ecommerce-Audit Trail GW APIs Definition

The list of provided APIs is shown in figure below. Endpoints which are currently not available are marked in grey.
 
![ecommerce-audit-trail-bridge](./assets/diagrams/ecommerce-audit-trail-bridge.jpeg)

> ### An interactive swagger documentation of the API can be found [here](https://ensuresec.solutions.iota.org/docs/).
> 
The Audit Trail GW implementation provides the following services:

__Channel Service__

The service allows to create new channels in the tangle. The identity creating the channel becomes the author of it and is able to read all messages and write data into the channel. Reading and writing from/to a channel is also offered by this service but subscribers need to be authorized before they are able to do so (see Subscription Service).

__Channel Info Service__

The service allows to search for one or more channels stored by the api. For instance the service could be used to query all channels created by a specific identity or with a specific topic. Furthermore it enables to maintain the channel in the database and also remove it. When removing the channel from the database the data won’t be removed from the ledger since the data is immutable but it is no more indexable at the api.

__Subscription Service__

The service allows to manage subscriptions to a specific channel. Identities can subscribe to a specific channel identified by a unique channel address. The author of the channel can then decide whether to authorize the identity to read or write from/to the channel. Authorized subscribers can also be revoked access to the channel afterwards. In addition this service can be used to list all authorized subscriptions to a channel.



<!-- update figure name if we decide to call it GW--> 
<!-- delete information from a channel/not to a channel-->


<!-- perhaps we need to explain the data model -->

### Channel Service 
__Prefix:__ `/api/v1/channels`

`POST /create`

Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.

`GET /logs/{channel-address}`

Get data from the channel by using the _channel-address_. The first possible message a subscriber can receive is the time the subscription got approved all messages before are not received. __Read__ permission is mandatory.

`POST /logs/{channel-address}`

Write data to a channel by using the _channel-address_. __Write__ permission is mandatory. The `type` and `metadata` fields are not encrypted to have a possibility to search for events. The `payload` is stored encrypted for encrypted channels. 

`GET /history/{channel-address}`

Get all data of a channel using a preshared-key. Mainly used by auditors to evaluate a log stream.

`POST /validate`

__TBD!__ _Validates data of a channel. Verifies payload against data on the IOTA Tangle._

>__Note:__ To increase speed of retrieving data from a channel, data are replicated in a local database, this prevents from fetching them directly from the ledger. However _validate_ allows to verify that a local database has the same copy of data.

<!-- this we need to explain since someone would expect data are only in the Tangle. What in case of permanodes? -->

`POST /re-import`

__TBD!__ _Re imports data into the database from the IOTA Tangle. The user can decide to re-import the data from the Tangle into the database. A reason for it could be a malicious state of the data._


### Channel Info Service 
__Prefix:__ `/api/v1/channel-info`

`GET /channel/{channel-address}`

Get information about a channel by using the _channel-address_.

`POST /channel`

Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.

`PUT /channel`

Update channel information. The author of a channel can update topics of a channel.

`DELETE /channel/{channel-address}`

Delete information of a channel by using the _channel-address_. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the IOTA Tangle since its data is immutable on the tangle!

`GET /search`

Search for a channel. A client can search for a channel which it is interested in.

### Subscription Service 
__Prefix:__ `/api/v1/subscription`

`GET /subscriptions/{channel-address}`

__TBD!__ _Get all subscriptions of a channel._

`POST /request/{channel-address}`

Request subscription to a channel by using the _channel-address_. A client can request a subscription to a channel which it then is able to read/write from. The subscriber can use an already generated seed or let it generate by the api so in this case the seed should be undefined.

`POST /authorize/{channel-address}`

Authorize a subscription to a channel by using the _channel-address_. The author of a channel can authorize a subscriber to read/write from a channel. Eventually after verifying its identity (using the Ecommerce-SSI Bridge).

`POST /remove/{channel-address}`

__TBD!__ _Remove subscription to a channel. The author or subscriber of a channel can remove a subscription from a channel. (A subscriber can only remove its own subscription)_


## HowTo: Create a channel, add a subscriber and read + write from it

<!-- adapt to one of the example above; present as tutorial -->

The following sequence diagram demonstrates the requests needed to write and read to/from a channel. The sequence diagram indicates two users: Tom which becomes the author and a IoT Device which is the subscriber.

![create channel sd](./assets/diagrams/write-logs-to-channel-sd.jpeg)

1. Each of the users trying to write or read from a channel needs to create an identity using the Ecommerce-SSI Bridge
2. Each of the identity must authenticate at the APIs in order to authenticate the requests are legit
3. One identity must create a channel (in this case Tom), this identity becomes the author of the channel and is able to authorize further identities to read and write from/to the channel
4. The second identity can request a subscription to the channel so it is able to read or write
5. The author is then able to authorize this suscription
6. After the author authorized the IoT Device it is able to write data to the channel
7. The author is then able to fetch the data of the IoT Device
