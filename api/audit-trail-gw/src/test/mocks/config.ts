import { Config, StreamsConfig } from '../../models/config';

export const StreamsConfigMock: StreamsConfig = {
	node: '',
	permaNode: '',
	statePassword: 'veryvery-very-very-server-secret'
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
	streamsConfig: StreamsConfigMock,
	commitHash: ''
};
