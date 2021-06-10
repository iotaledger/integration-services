export interface AuthenticationServiceConfig {
	serverSecret: string;
	jwtExpiration: string;
	serverIdentityId: string;
	keyCollectionSize: number;
}
