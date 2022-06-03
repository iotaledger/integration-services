---
keywords:
- how to
- subscribe to channel
- immutable data channel
- Channel
- Subscriber
- Identity
- CLI
- Verifiable Credential
description: The IS-CLI allows technical as well as non-technical users to interact with Integration Services Audit Trail Gateway and SSI Bridge.
---

# CLI for Integration Services

The IS-CLI allows technical as well as non-technical users to interact with Integration Services `Audit Trail Gateway`
and `SSI Bridge`. In a simple way users can create and manage Identities, Verifiable Credentials and Channels as well as retrieve information about them with different commands. The syntax is kept simple and it doesn't take a lot of time learning to start interacting with the services.



# Prerequisites

-   min. Node v15.6.0

# Installation

```sh
npm install -g @iota/is-cli@latest
```

or for one-time use

```sh
npx @iota/is-cli <command>
```


# Configurations

### Configure CLI for local API access 
```sh
is config -s http://localhost:3001 -a http://localhost:3002 -k <your-api-key>
```

### Configure API environment
```sh
is setup-node
```

### View all commands
```
is help
```

-   For most of the channel and identity commands is a "identity.json" in the directory where the cli is executed needed.


