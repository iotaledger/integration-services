import { Config, IdentityConfig } from '../../models/config';

export const IdentityConfigMock: IdentityConfig = {
	keyCollectionTag: 'key-collection',
	explorer: '',
	network: 'test',
	node: '',
	keyType: 0,
	hashFunction: 0,
	hashEncoding: 'base58'
};

export const ConfigMock: Config = {
	jwtExpiration: '1 day',
	identityConfig: IdentityConfigMock,
	apiKey: '',
	serverSecret: 'veryvery-very-very-server-secret',
	databaseName: '',
	databaseUrl: '',
	apiVersion: '0.1',
	port: 3000,
	serverIdentityId: 'did:iota:1234',
	streamsNode: ''
};
