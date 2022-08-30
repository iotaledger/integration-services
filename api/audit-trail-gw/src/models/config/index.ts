export interface Config {
	port: number;
	apiVersion: string;
	databaseUrl: string;
	databaseName: string;
	streamsConfig: StreamsConfig;
	serverSecret: string;
	jwtSecret: string;
	apiKey: string | undefined;
	hornetNode: string;
	permaNode: string;
	commitHash: string;
	ssiBridgeUrl: string;
	ssiBridgeApiKey: string;
}

export interface StreamsConfig {
	statePassword: string;
	node: string;
	permaNode: string;
}
