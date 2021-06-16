import { UserService } from './user-service';
import { createNonce, getHexEncodedKey, verifySignedNonce } from '../utils/encryption';
import * as AuthDb from '../database/auth';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';
import { SsiService } from './ssi-service';
import { User, UserRoles, UserType } from '../models/types/user';

export class AuthenticationService {
	constructor(
		private readonly userService: UserService,
		private readonly ssiService: SsiService,
		private readonly config: AuthenticationServiceConfig
	) {}

	getNonce = async (identityId: string) => {
		const nonce = createNonce();
		await AuthDb.upsertNonce(identityId, nonce);
		return nonce;
	};

	authenticate = async (signedNonce: string, identityId: string) => {
		let user: User = await this.userService.getUser(identityId);

		if (!user) {
			const doc = await this.ssiService.getLatestIdentityDoc(identityId);
			const publicKey = this.ssiService.getPublicKey(doc);
			if (publicKey) {
				user = {
					identityId,
					publicKey,
					type: UserType.Unknown,
					role: UserRoles.User
				};
			}
		}

		if (!user) {
			throw new Error(`no identity with id: ${identityId} found!`);
		}
		const { nonce } = await AuthDb.getNonce(identityId);
		const publicKey = getHexEncodedKey(user.publicKey);

		const verified = await verifySignedNonce(publicKey, nonce, signedNonce);
		if (!verified) {
			throw new Error('signed nonce is not valid!');
		}

		if (!this.config?.serverSecret) {
			throw new Error('no server secret set!');
		}

		const signedJwt = jwt.sign({ user }, this.config.serverSecret, { expiresIn: this.config?.jwtExpiration });
		return signedJwt;
	};
}
