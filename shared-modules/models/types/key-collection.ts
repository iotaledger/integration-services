import { VerifiableCredentialJson } from './identity';

export interface KeyCollectionPersistence {
	index: number;
	count: number;
	type: string;
	publicKeyBase58: string;
	keys: SimpleKeyPair[];
}

export interface SimpleKeyPair {
	public: string;
	secret: string;
}

export interface VerifiableCredentialPersistence {
	index: number;
	initiatorId: string;
	isRevoked: boolean;
	vc: VerifiableCredentialJson;
}

export interface KeyCollectionJson {
	type: string;
	keys: SimpleKeyPair[];
	publicKeyBase58: string;
}
