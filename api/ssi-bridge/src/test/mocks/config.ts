import { Config, IdentityConfig } from '../../models/config';

export const IdentityConfigMock: IdentityConfig = {
	node: '',
	permaNode: '',
	bitmapTag: 'signature-bitmap'
};

export const ConfigMock: Config = {
	jwtExpiration: '1 day',
	identityConfig: IdentityConfigMock,
	apiKey: 'test-v1',
	serverSecret: 'veryvery-very-very-server-secret',
	jwtSecret: 'veryvery-very-very-server-secret',
	databaseName: 'testdatabasename',
	databaseUrl: 'testdatabaseurl',
	apiVersion: '0.1',
	port: 3000,
	permaNode: 'testpermanodeurl',
	hornetNode: 'testhornetnodeurl',
	commitHash: ''
};
