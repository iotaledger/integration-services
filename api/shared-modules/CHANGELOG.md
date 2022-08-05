# Changelog

### 0.2.1 (2022-08-05)

- Added `encrypt` field to `IdentityKeys` with X25519 keys for encryption

### 0.2.0 (2022-07-22) **BREAKING CHANGES**

- Remove publicKey from identity and identity search
- Rename `secrect` to `private` of the identity keys
- Rename `key` to `keys` of the identity keys
- Adjust `IdentityDocument`to fulfill new data model
- Remove `Json` from type and schema names
- rename verifiable credential `initiatorId` to `initiator`

### 0.1.20 (2022-07-22)

- Moved web imports to web folder

### 0.1.19 (2022-07-22)

- Fixed typings import

### 0.1.18 (2022-07-22)

- Replaced export maps with simple folder imports, imports requiring node can still be imported with `@iota/is-shared-modules/node`

### 0.1.17 (2022-07-22) **POTENTIALLY BREAKING**

- Adjusted imports with export maps, imports requiring node can now be imported with `@iota/is-shared-modules/node`, all other imports are still available with `@iota/is-shared-modules`

### 0.1.16 (2022-07-15)

- Removed `visibilityList` from ChannelInfoSearchSchema

### 0.1.15 (2022-07-07)

- Changed property `isPrivate` to `hidden` IdentityWithoutIdFields and IdentityWithoutIdAndCredentialFields

### 0.1.14 (2022-07-07)

- Added `hidden` and `visibilityList` properties to CreateChannelBodySchema, ChannelInfoSchema and ChannelInfoSearchSchema

### 0.1.13 (2022-07-05)

- Reverted new changes due to compatibility issues

### 0.1.12 (2022-07-05)

- Updated and removed unused dependencies
