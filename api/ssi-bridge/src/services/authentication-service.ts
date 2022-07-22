import { UserService } from './user-service';
import { User, UserRoles } from '@iota/is-shared-modules';
import { createNonce, verifySignedNonce, getHexEncodedKey } from '@iota/is-shared-modules/node';
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
		const res = await this.ssiService.getLatestIdentityDoc(id);

		if (!res?.document) {
			throw Error(`no identity with id: ${id} found!`);
		}

		const publicKeyBase = await this.ssiService.getPublicKey(res.document);
		const publicKey = publicKeyBase.substring(1); // strip the z from the public key

		if (!user) {
			if (publicKey) {
				user = {
					id,
					username: id,
					role: UserRoles.User
				};
			}
		}

		const { nonce } = await AuthDb.getNonce(id);
		const encodedPublicKey = getHexEncodedKey(publicKey);
		const verified = await verifySignedNonce(encodedPublicKey, nonce, signedNonce);

		if (!verified) {
			throw new Error('signed nonce is not valid!');
		}

		if (!this.config?.jwtSecret) {
			throw new Error('no jwt secret set!');
		}

		const jwtPayload = {
			user: {
				id: user.id,
				role: user.role,
				username: user.username
			}
		};

		const signedJwt = jwt.sign(jwtPayload, this.config.jwtSecret, { expiresIn: this.config?.jwtExpiration });
		return signedJwt;
	}
}
