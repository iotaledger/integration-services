import { Config, StreamsConfig } from '../../models/config';

export const StreamsConfigMock: StreamsConfig = {
	node: '',
	permaNode: '',
	password: 'veryvery-very-very-server-secret'
};

export const ConfigMock: Config = {
	apiKey: 'test-v1',
	serverSecret: 'veryvery-very-very-server-secret',
	jwtSecret: 'veryvery-very-very-server-secret',
	databaseName: 'testdatabasename',
	databaseUrl: 'testdatabaseurl',
	apiVersion: '0.1',
	port: 3000,
	permaNode: 'testpermanodeurl',
	hornetNode: 'testhornetnodeurl',
	ssiBridgeApiKey: '',
	ssiBridgeUrl: 'http://localhost:3001/api/v0.2',
	streamsConfig: StreamsConfigMock,
	commitHash: ''
};
