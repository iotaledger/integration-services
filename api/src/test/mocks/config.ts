import { Config, IdentityConfig, StreamsConfig } from '../../models/config';

export const StreamsConfigMock: StreamsConfig = {
	node: '',
	permaNode: '',
	statePassword: 'veryvery-very-very-server-secret'
};

export const IdentityConfigMock: IdentityConfig = {
	keyCollectionTag: 'key-collection',
	keyCollectionSize: 2,
	explorer: '',
	network: 'test',
	node: '',
	permaNode: '',
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
	permaNode: '',
	hornetNode: '',
	streamsConfig: StreamsConfigMock,
	commitHash: ''
};
