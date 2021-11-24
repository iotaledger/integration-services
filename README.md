![banner](./api/assets/Secure_Digital_Infrastructure.jpg)

<p align="center">
  <a href="https://iota.stackexchange.com/" style="text-decoration:none;"><img src="https://img.shields.io/badge/StackExchange-9cf.svg?logo=stackexchange" alt="StackExchange"></a>
  <a href="https://discord.iota.org/" style="text-decoration:none;"><img src="https://img.shields.io/badge/Discord-9cf.svg?logo=discord" alt="Discord"></a>
  <a href="https://discord.iota.org/" style="text-decoration:none;"><img src="https://img.shields.io/discord/397872799483428865" alt="Discord"></a>
  <a href="https://github.com/iotaledger/integration-services/blob/master/LICENSE" style="text-decoration:none;"><img src="https://img.shields.io/github/license/iotaledger/bee.svg" alt="Apache 2.0 license"></a>

<!--  
  <img src="https://deps.rs/repo/github/iotaledger/identity.rs/status.svg" alt="Dependencies">
  <a href='https://coveralls.io/github/iotaledger/identity.rs?branch=dev'><img src='https://coveralls.io/repos/github/iotaledger/identity.rs/badge.svg?branch=dev' alt='Coverage Status' /></a>
-->

</p>

<p align="center">
  <a href="#introduction">Introduction</a> ◈
  <a href="#documentation-and-resources">Documentation & Resources</a> ◈
  <a href="#prerequisites">Prerequisites</a> ◈
  <a href="#contributing">Contributing</a>
  <!--
  <a href="#getting-started">Getting Started</a> ◈
  <a href="#example-creating-an-identity">Example</a> ◈
  <a href="#roadmap-and-milestones">Roadmap</a> ◈
  -->
</p>

---

## Introduction

IOTA Integration Services is a [Node](https://nodejs.org/) microservice responsible to simplify access to decentralized digital identity, 
also known as Self-Sovereign Identity (SSI) and Streams techonology on the IOTA tangle. 

> :warning: **WARNING** :warning:
>
> This library is currently in its **under development** and might undergo large changes!
> Until a formal third-party security audit has taken place, the [IOTA Foundation](https://www.iota.org/) makes no guarantees to the fitness of this library. 
> As such, it is to be seen as **experimental** and not ready for real-world applications.
> Nevertheless, we are very interested in feedback about user experience, design and implementation, and encourage you to reach out with any concerns or suggestions you may have.

## Documentation and Resources

- [API Reference](https://wiki.iota.org/integration-services/api_reference): Integration Service API documentation.
- [Documentation Pages](https://wiki.iota.org/integration-services/welcome): Wiki including setup API on-prem and on cloud with simple examples on service usage.
- 
- [Examples on Decentralized Identity](https://wiki.iota.org/integration-services/examples/intro_identity): Practical code snippets to get you started with the decentralized identity API
- [Examples on Audit Trail](https://wiki.iota.org/integration-services/examples/intro_audittrail): Practical code snippets to get you started with the Audit Trail API
- [IOTA Integration Service Website](https://www.iota.org/solutions/secure-digital-infrastructure): Website for a collaborative effort to provide help, guidance and spotlight to the IOTA Integration Services Community through offering feedback and introducing consistent workflows around IOTA decentralized identities and audit trails.

## Prerequisites

- [Node](https://nodejs.org/) (>= 15.14.0)

<!--
## Getting Started

If you want to include IOTA Identity in your project, simply add it as a dependency in your `Cargo.toml`:
```rust
[dependencies]
identity = { git = "https://github.com/iotaledger/identity.rs", branch = "main"}
```

To try out the [examples](https://github.com/iotaledger/identity.rs/tree/main/examples), you can also do this:

1. Clone the repository, e.g. through `git clone https://github.com/iotaledger/identity.rs `
2. Build the repository with `cargo build `
3. Run your first example using `cargo run --example getting_started `

If you would like to build the [API Reference](https://wiki.iota.org/identity.rs/libraries/rust/api_reference) yourself from source, you can do so using:
```rust
cargo doc --document-private-items --no-deps --open
```

## Example: Creating an Identity

*Cargo.toml*
```rust
[package]
name = "iota_identity_example"
version = "1.0.0"
edition = "2021"

[dependencies]
identity = { git = "https://github.com/iotaledger/identity.rs", branch = "main", features = ["account"]}
pretty_env_logger = { version = "0.4" }
tokio = { version = "1.5", features = ["full"] }
```
*main.*<span></span>*rs*
```rust
use std::path::PathBuf;

use identity::account::Account;
use identity::account::AccountStorage;
use identity::account::IdentitySetup;
use identity::account::Result;
use identity::iota::IotaDocument;

#[tokio::main]
async fn main() -> Result<()> {
  pretty_env_logger::init();

  // The Stronghold settings for the storage.
  let stronghold_path: PathBuf = "./example-strong.hodl".into();
  let password: String = "my-password".into();

  // Create a new identity with default settings and
  // Stronghold as the storage.
  let account: Account = Account::builder()
    .storage(AccountStorage::Stronghold(stronghold_path, Some(password)))
    .create_identity(IdentitySetup::default())
    .await?;

  println!("[Example] Local Document = {:#?}", account.document());

  // Fetch the DID Document from the Tangle
  //
  // This is an optional step to ensure DID Document consistency.
  let resolved: IotaDocument = account.resolve_identity().await?;

  println!("[Example] Tangle Document = {:#?}", resolved);

  Ok(())
}
```
*Example output*
```rust
DID Document Transaction > https://explorer.iota.org/mainnet/message/de795095cc7970c2aa4efabfe9885bd07be6664219464697b4b7506d9a87fbe3
```
The output link points towards the DID Document transaction, viewable through the IOTA Tangle Explorer, see [here](https://explorer.iota.org/mainnet/message/de795095cc7970c2aa4efabfe9885bd07be6664219464697b4b7506d9a87fbe3). You can see the full DID Document as transaction payload.

-->

<!--
## Roadmap and Milestones

For detailed development progress, see the IOTA Identity development [kanban board](https://github.com/iotaledger/identity.rs/projects/3).

IOTA Identity is in heavy development, and will naturally change as it matures and people use it. The chart below isn't meant to be exhaustive, but rather helps to give an idea for some of the areas of development and their relative completion:

#### Basic Framework

| Feature                   | Not started | In Research | In Development | Done | Notes                                                                |
| :------------------------- | :---------: | :------: | :---------------: | :-:  | :-------------------------------------------------------------------- |
| Implement IOTA DID Method | | | | :heavy_check_mark: | Finished implementation. |
| [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) | | | | :heavy_check_mark: | Finished implementation. |
| Account | | | :large_orange_diamond: | | Base implementation done, more features to be added. |
| [DID Comms](https://identity.foundation/didcomm-messaging/spec/) | | | :large_orange_diamond: | | Initial version done, but more to come |
| Identity Actor | | :large_orange_diamond: | | | |
| Selective Disclosure | :large_orange_diamond: | | | | |
| Zero Knowledge Proofs | | :large_orange_diamond: | | | |
| Support Embedded Rust | | :large_orange_diamond: | | | |
| [WASM Bindings](https://github.com/iotaledger/identity.rs/tree/main/bindings/wasm) | | | :large_orange_diamond: | | implemented for low-level APIs |
| [Code Examples](https://github.com/iotaledger/identity.rs/tree/main/examples) | | | | :large_orange_diamond: | |
| [API Reference](https://wiki.iota.org/identity.rs/libraries/rust/api_reference) | | | :large_orange_diamond: | | |
| [Documentation Portal](https://wiki.iota.org/identity.rs/introduction) | | | :large_orange_diamond: | | |


#### Next Milestones

At the current state, the framework is in beta. As the framework matures we expect to support more and more types of applications. We recommend no use in real-world applications until the consumed libraries are audited, but experimentation and Proof-of-Concept projects are encouraged at the different stages.

The next milestone is the release of version 1.0, which will stabilize the APIs, support backwards compatibility and versioned identities. This makes updating to future versions much easier. In addition it will provide full documentation coverage and the release will be audited.

Afterwards, we are already planning a future update containing privacy enhancing features such as Selective Disclosure and Zero Knowledge Proofs.
-->

## Contributing

We would love to have you help us with the development of IOTA Integration Services. Each and every contribution is greatly valued!

To contribute directly to the repository, simply fork the project, push your changes to your fork and create a pull request to get them included!

The best place to get involved in discussions about this framework or to look for support at is the `#integration-services` channel on the [IOTA Discord](http://discord.iota.org). 


You can also ask questions on our [Stack Exchange](https://iota.stackexchange.com/).