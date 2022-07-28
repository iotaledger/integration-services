export interface Config {
	port: number;
	apiVersion: string;
	databaseUrl: string;
	databaseName: string;
	identityConfig: IdentityConfig;
	serverSecret: string;
	jwtSecret: string;
	apiKey: string | undefined;
	hornetNode: string;
	permaNode: string;
	jwtExpiration: string;
	commitHash: string;
}

export interface IdentityConfig {
	node: string;
	permaNode: string;
	bitmapTag: string;
}
