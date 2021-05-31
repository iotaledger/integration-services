# Ecommerce-Audit Trail Bridge

The Ecommerce-Audit Trail Bridge allows users to create immutable data channels and share them with others. By requesting a subscription to a channel a so called subscriber can request `Read`, `Write`, `ReadAndWrite` access to the channel. This request must then be authorized by the creator (author) of the channel. After a subscriber is authorized, he is then able to write/read to/from the channel. 

## Ecommerce-Audit Trail Bridge APIs Definition

The list of provided APIs is shown in figure below. Endpoints which are currently not available are marked in grey.

![ecommerce-audit-trail-bridge](./src/assets/diagrams/ecommerce-audit-trail-bridge.jpeg)

### Channel Service 
__Prefix:__ `/api/v1/channel`

`POST /create`

Create a new channel. An author can create a new channel with specific topics where other clients can subscribe to.

_Body:_

```
{
	topics: {
        type: string,
        source: string
    }[],
	encrypted: boolean,
	seed?: string
}
```

_Response:_
```
{
    "seed": string,
    "channelAddress": string
}
```


`GET /logs/{channel-address}`

Get data from the stream. First entry is the start of the subscription. __Read__ permission is mandatory.

_Body:_

```
```

_Response:_
```
[
    {
        "link": string,
        "channelLog": {
            "type": string,
            "payload": any,
            "metadata"?: any
        }
    }
]
```

`POST /logs`

Write data to a channel. __Write__ permission is mandatory. 

_Body:_

```
{
    "type": string,
    "payload": any,
    "metadata"?: any
}
```

_Response:_
```
{
    "link": string
}
```


`GET /history/{channel-address}`

__TBD!__ _Get all data of a stream using a shared key. Mainly used from auditors to evaluate a log stream. Read permissions are mandatory._


### Channel Info Service 
__Prefix:__ `/api/v1/channel-info`

`POST /validate`

__TBD!__ _Validates data of a stream. Verifies data of the database against data on the tangle. If the data is verified the status field will be set to verified. Other data states are: synchronizing, outdated, malicious. If the client does not want to verify the data and trusts the status of the server it can tell the api that it only wants to receive the status._

`POST /re-import`

__TBD!__ _Re imports data into the database from the tangle. The user can decide to re import the data from the tangle into the database. A reason for it could be a malicious state of the data._

`GET /channel/{channel-address}`

Get information about a channel.

_Body:_

```
```

_Response:_
```
{
    "created": string,
    "authorId": string,
    "subscriberIds": string[],
    "topics": {
        type: string,
        source: string
    }[],
    "encrypted": boolean,
    "latestLink": string,
    "channelAddress": string
}
```

`POST /channel`

Add an existing channel into the database. Clients are able to add existing channels into the database so others can subscribe to them. This will be automatically called when a channel will be created.

_Body:_

```
{
    "created": string,
    "authorId": string,
    "subscriberIds": string[],
    "topics": {
        type: string,
        source: string
    }[],
    "encrypted": boolean,
    "latestLink": string,
    "channelAddress": string
}
```

_Response:_
```
```


`PUT /channel`

Update channel information. The author of a channel can update topics of a channel.

_Body:_

```
{
    "created": string,
    "authorId": string,
    "subscriberIds": string[],
    "topics": {
        type: string,
        source: string
    }[],
    "encrypted": boolean,
    "latestLink": string,
    "channelAddress": string
}
```

_Response:_
```
```


`DELETE /channel/{channel-address}`

Delete information of a channel. The author of a channel can delete its entry in the database. In this case all subscriptions will be deleted and the channel won’t be found in the system anymore. The data & channel won’t be deleted from the tangle since its data is immutable on the tangle!

_Body:_

```
```

_Response:_
```
```

`GET /search`

Search for a channel. A client can search for a channel which he is interested in.


### Subscription Service 
__Prefix:__ `/api/v1/subscription`

`GET /subscriptions/{channel-address}`

__TBD!__ _Get all subscriptions of a channel._

`POST /request/{channel-address}`

Request subscription to a channel. A client can request a subscription to a channel which he then is able to read/write from.

_Body:_

```
{
    "accessRights": "ReadAndWrite" | "Read" | "Write"
}
```

_Response:_
```
{
    "seed": string,
    "subscriptionLink": string,
}
```

`POST /authorize/{channel-address}`

Authorize a subscription to a channel. The author of a channel can authorize a subscriber to read/write from a channel.

_Body:_

```
{
    "userId": string
}
```

_Response:_
```
{
    "keyloadLink": string,
}
```

`POST /remove/{channel-address}`

__TBD!__ _Remove subscription to a channel. The author or subscriber of a channel can remove a subscription from a channel. (A subscriber can only remove its own subscription)_


