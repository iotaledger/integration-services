import { createNonce, verifySignedNonce, getHexEncodedKey } from '@iota-is/shared-modules/lib/utils/encryption';
import * as AuthDb from '../database/auth';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';
import { SsiService } from './ssi-service';
import { UserRoles } from '@iota-is/shared-modules/lib/models/types/user';

export class AuthenticationService {
	constructor(private readonly ssiService: SsiService, private readonly config: AuthenticationServiceConfig) {}

	async getNonce(id: string) {
		const nonce = createNonce();
		await AuthDb.upsertNonce(id, nonce);
		return nonce;
	}

	async authenticate(signedNonce: string, id: string) {
		const doc = await this.ssiService.getLatestIdentityDoc(id);
		const publicKey = this.ssiService.getPublicKey(doc);

		if (!publicKey) {
			throw new Error(`no identity with id: ${id} found!`);
		}

		const user = {
			id,
			publicKey,
			role: UserRoles.User
		};

		const { nonce } = await AuthDb.getNonce(id);
		const encodedPublicKey = getHexEncodedKey(publicKey);

		const verified = await verifySignedNonce(encodedPublicKey, nonce, signedNonce);

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
