import { UserService } from './user-service';
import { createNonce, getHexEncodedKey, verifySignedNonce } from '../utils/encryption';
import * as AuthDb from '../database/auth';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';

export class AuthenticationService {
	private readonly userService: UserService;
	private readonly serverSecret: string;
	private readonly jwtExpiration: string;

	constructor(userService: UserService, authenticationServiceConfig: AuthenticationServiceConfig) {
		const { serverSecret, jwtExpiration } = authenticationServiceConfig;
		this.userService = userService;
		this.serverSecret = serverSecret;
		this.jwtExpiration = jwtExpiration;
	}

	getNonce = async (identityId: string) => {
		const user = await this.userService.getUser(identityId);
		if (!user) {
			throw new Error(`no user with id: ${identityId} found!`);
		}

		const nonce = createNonce();
		await AuthDb.upsertNonce(user.identityId, nonce);
		return nonce;
	};

	authenticate = async (signedNonce: string, identityId: string) => {
		const user = await this.userService.getUser(identityId);
		if (!user) {
			throw new Error(`no user with id: ${identityId} found!`);
		}
		const { nonce } = await AuthDb.getNonce(identityId);
		const publicKey = getHexEncodedKey(user.publicKey);

		const verified = await verifySignedNonce(publicKey, nonce, signedNonce);
		if (!verified) {
			throw new Error('signed nonce is not valid!');
		}

		if (!this.serverSecret) {
			throw new Error('no server secret set!');
		}

		const signedJwt = jwt.sign({ user }, this.serverSecret, { expiresIn: this.jwtExpiration });
		return signedJwt;
	};
}
