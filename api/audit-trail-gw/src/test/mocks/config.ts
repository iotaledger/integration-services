import { Config, IdentityConfig, StreamsConfig } from '../../models/config';

export const StreamsConfigMock: StreamsConfig = {
	node: '',
	permaNode: '',
	statePassword: 'veryvery-very-very-server-secret'
};

export const IdentityConfigMock: IdentityConfig = {
	keyCollectionTag: 'key-collection',
	keyCollectionSize: 2,
	node: '',
	permaNode: '',
	keyType: 0,
	hashFunction: 0,
	hashEncoding: 'base58'
};

export const ConfigMock: Config = {
	identityConfig: IdentityConfigMock,
	apiKey: 'test-v1',
	serverSecret: 'veryvery-very-very-server-secret',
	databaseName: 'testdatabasename',
	databaseUrl: 'testdatabaseurl',
	apiVersion: '0.1',
	port: 3000,
	permaNode: 'testpermanodeurl',
	hornetNode: 'testhornetnodeurl',
	streamsConfig: StreamsConfigMock,
	commitHash: ''
};
