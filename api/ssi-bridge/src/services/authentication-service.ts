import { UserService } from './user-service';
import { createNonce, getHexEncodedKey, verifySignedNonce, User, UserRoles } from '@iota/is-shared-modules';
import * as AuthDb from '../database/auth';
import jwt from 'jsonwebtoken';
import { AuthenticationServiceConfig } from '../models/config/services';
import { SsiService } from './ssi-service';
import { ILogger } from '../utils/logger';

export class AuthenticationService {
	constructor(
		private readonly userService: UserService,
		private readonly ssiService: SsiService,
		private readonly config: AuthenticationServiceConfig,
		private readonly logger: ILogger
	) {}

	async getNonce(id: string) {
		const nonce = createNonce();
		await AuthDb.upsertNonce(id, nonce);
		return nonce;
	}

	verifyJwt(token: string): { isValid: boolean; error?: string } {
		try {
			jwt.verify(token, this.config.jwtSecret);
		} catch (e) {
			this.logger.error(e?.message);
			return { isValid: false, error: e?.message };
		}

		return { isValid: true };
	}

	async authenticate(signedNonce: string, id: string) {
		let user: User = await this.userService.getUser(id);

		if (!user) {
			const doc = await this.ssiService.getLatestIdentityDoc(id);
			const publicKey = this.ssiService.getPublicKey(doc);

			if (publicKey) {
				user = {
					id,
					username: id,
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

		if (!this.config?.jwtSecret) {
			throw new Error('no jwt secret set!');
		}

		const jwtPayload = {
			user: {
				publicKey: user.publicKey,
				id: user.id,
				role: user.role,
				username: user.username
			}
		};

		const signedJwt = jwt.sign(jwtPayload, this.config.jwtSecret, { expiresIn: this.config?.jwtExpiration });
		return signedJwt;
	}
}
