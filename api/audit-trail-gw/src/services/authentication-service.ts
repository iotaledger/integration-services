import { createNonce, getHexEncodedKey, verifySignedNonce } from '../utils/encryption';
import * as AuthDb from '../database/auth';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';
import { SsiService } from './ssi-service';
import { User, UserRoles } from '@iota-is/shared-modules/lib/types/user';

export class AuthenticationService {
	constructor(private readonly ssiService: SsiService, private readonly config: AuthenticationServiceConfig) {}

	async getNonce(id: string) {
		const nonce = createNonce();
		await AuthDb.upsertNonce(id, nonce);
		return nonce;
	}

	async authenticate(signedNonce: string, id: string) {
		const doc = await this.ssiService.getLatestIdentityDoc(id);
		let user: User = undefined;
		if (!doc) {
			const publicKey = this.ssiService.getPublicKey(doc);
			if (publicKey) {
				user = {
					id,
					publicKey,
					role: UserRoles.User
				};
			}
		}

		if (!user) {
			throw new Error(`no identity with id: ${id} found!`);
		}
		const { nonce } = await AuthDb.getNonce(id);
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
	}
}
