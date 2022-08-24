# Changelog

### 0.2.3-alpha.1 (2022-08-24)

- Updated method for creating idenities locally.

### 0.2.3-alpha.0 (2022-08-24)

- Added method to identity client for creating idenities locally.

### 0.2.2 (2022-08-16)

- Added ApiVersion enum in models

### 0.2.1 (2022-08-15)

- Fixed tests by adjusting the urls and adding new admin and user to test-data 

### 0.2.1-alpha.4 (2022-08-03)

- Add `createVerifiablePresentation` method to identity client.

### 0.2.1-alpha.3 (2022-08-15)

- Added assigning of the api version variables in base.ts

### 0.2.1-alpha.2 (2022-08-15)

- Adjusted authentication url by adding the api version of ssi bridge.

### 0.2.1-alpha.1 (2022-08-15)

- Adjusted urls in the constructor when creating identity and channel clients.

### 0.2.1-alpha.0 (2022-08-15)

- Added `apiVersionAuditTrail` and `apiVersionSsiBridge` properties to `ClientConfig`

### 0.2.0 (2022-08-12)

- Upgraded shared-modules version to 0.2.1 and removed ApiVersion type (api version should now be included in the env variables of the service urls)

### 0.2.0-alpha.1 (2022-07-29)

- Export of `IdentityKeys` from models

### 0.2.0-alpha.0 (2022-07-28)

- Updated `is-shared-modules` version to `0.2.0-alpha.7`

### 0.1.21 (2022-07-25)

- Added `ChannelType` export from `@iota/is-shared-modules`

### 0.1.20 (2022-07-25)

- Adjusted imports of `@iota/is-shared-modules` to the newest version (the client is now again web-compatible)
- Fixed `hidden` parameter in channel-info search

### 0.1.19 (2022-07-18)

- Added `hidden` parameter for creating an idenitity
- Removed `visbilityList` for channel search.

### 0.1.18 (2022-07-14)

- Updated search method for a channel with parameter `hidden` and `visbilityList`
- Extended get method in base.ts to send data in body e.g. `visbilityList` when searching for channels.

### 0.1.17 (2022-07-05)

- Updated dependencies
- Updated broken tests due to dependency updates
