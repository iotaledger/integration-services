# Examples

In this example we will show how to create Identities, Channels and how to subscribe to a channel, authorize one Subscriber and write data into a Channel.


### Create json files

First create two files `identityA.json` and `identitiyB.json` for creating these Identities with the CLI in the next step. Rename for the second file the `username`.

```json
{
	"username": "actorA",
	"claimType": "User",
	"claim": {
		"name": "John",
		"surname": "Smith"
	}
}
```

### Create the Identities
```sh
is create-identity -i examples/identityA.json -o identityA.json 
```
```sh
is create-identity -i examples/identityB.json -o identityB.json 
```

### Create a Channel

Next we will create a private Channel with a topic `logs` and the source `device` and save the created Channel in a file called `channelA.json`. For public Channels add the option `-pC`. For public Channels a subscriber is automatically authorized to the Channel but can't write into it. The user can read the history of this channel with the command `is read-channel-history`.

```sh
is create-channel -i identityA.json -t logs -s device -o channelA.json -pC test-channel
```

### Write to Channel

The creator of the Channel can directly write into it.

```sh
is write-channel -i identityA.json -p "hello world" <Channel address of channelA>
```

### Request Subscription 

Other users need first to subscribe to a Channel.
```sh
is subscribe-channel -i identityB.json <Channel address of channelA>
```

### Authorize Subscription

The creator of the Channel authorize one subscriber.
```sh
is authorize-channel -i identityA.json <Channel address of channelA> <Id of identityB>
```

### Write message as a subscriber

After the authorization the subscriber can write into the Channel.
```sh
is write-channel -i identityB.json -p "Can you hear me?" <Channel address of channelA>
```

### Read Channel

The subscriber can read the Channel entries but just only the ones after he was authorized to the Channel.
```sh
is read-channel -i identityB.json <Channel address of channelA> 
```

### Read history of Channel

The user can also read the history of a Channel. Especially if the Channel is `public` it is the only way for the subscriber to read from the Channel. For that add the option `-pC` and remove the option for the preshared Key `-psK`.

```sh
is read-channel-history -i identityB.json -psK <preshared key> <Channel address of channelA> 
```

### Revoke Subscription 

At any time the creator of a Channel can revoke the Subscription of other users.
```sh
is revoke-subscription -i identityA.json -sI <Id of identityB> <Channel address of channelA> 
```

### Find subscription

We can also double check if the Subscription is revoked by simply trying to find it. 
```sh
is find-subscription -i identityA.json -sI <Id of identityB> <Channel address of channelA> 
```

### Help

```sh
is help
```
For one specific command
```sh
is <command> --help
```
