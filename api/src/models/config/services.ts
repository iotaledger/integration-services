export interface AuthenticationServiceConfig {
	serverSecret: string;
	jwtExpiration: string;
}
export interface VerificationServiceConfig {
	keyCollectionSize: number;
	serverSecret: string;
}
