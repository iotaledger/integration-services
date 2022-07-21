import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { VerifiableCredentialJson, Credential, IdentityKeys, LatestIdentityJson, Encoding } from '@iota/is-shared-modules';
const { Document, Credential, Client, KeyPair, KeyType, Resolver, AccountBuilder } = Identity;
import { ILogger } from '../utils/logger';
import * as bs58 from 'bs58';

export class SsiService {
	private static instance: SsiService;
	private constructor(private readonly config: IdentityConfig, private readonly logger: ILogger) {}

	public static getInstance(config: IdentityConfig, logger: ILogger): SsiService {
		if (!SsiService.instance) {
			SsiService.instance = new SsiService(config, logger);
		}
		return SsiService.instance;
	}

	async createRevocationBitmap(
		bitmapIndex: number,
		issuerIdentity: {
			id: string;
			key: Identity.KeyPair;
		}
	): Promise<Identity.IService> {
		try {
			const { doc, messageId } = await this.getLatestIdentityDoc(issuerIdentity.id);
			const key = issuerIdentity.key;
			const revocationBitmap = new Identity.RevocationBitmap();
			const bitmapService = {
				id: this.getBitmapTag(issuerIdentity.id, bitmapIndex),
				serviceEndpoint: revocationBitmap.toEndpoint(),
				type: Identity.RevocationBitmap.type()
			};
			const service = new Identity.Service(bitmapService);
			doc.insertService(service);

			await this.publishSignedDoc(doc, key, messageId);
			return bitmapService;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not generate the bitmap');
		}
	}

	async createIdentity(): Promise<IdentityKeys> {
		try {
			const identity = await this.generateIdentity();
			const publicKey = bs58.encode(identity.key.public());
			const privateKey = bs58.encode(identity.key.private());
			const keyType = identity.key.type() === 1 ? 'ed25519' : 'x25519'; // TODO use enum or static string

			return {
				id: identity.doc.id().toString(),
				key: {
					public: publicKey,
					secret: privateKey,
					type: keyType,
					encoding: Encoding.base58
				}
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the identity');
		}
	}

	async createVerifiableCredential<T>(
		identityKeys: IdentityKeys,
		credential: Credential<T>,
		bitmapIndex: number,
		subjectKeyIndex: number
	): Promise<any> {
		try {
			const { doc, key } = await this.restoreIdentity(identityKeys);
			const issuerId = doc.id().toString();
			const unsignedVc = new Credential({
				id: credential.id,
				type: credential.type,
				credentialStatus: {
					id: this.getBitmapTag(issuerId, bitmapIndex),
					type: Identity.RevocationBitmap.type(),
					revocationBitmapIndex: subjectKeyIndex
				},
				issuer: issuerId,
				credentialSubject: credential.subject as any // TODO adjust subject type
			});
			const methodId = doc.defaultSigningMethod().id().toString();
			const signedCredential = await doc.signCredential(unsignedVc, key.private(), methodId, Identity.ProofOptions.default());
			return signedCredential.toJSON();
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the verifiable credential');
		}
	}

	async checkVerifiableCredential(signedVc: VerifiableCredentialJson): Promise<boolean> {
		try {
			const issuerDoc = (await this.getLatestIdentityDoc(signedVc.issuer)).doc;
			const credentialVerified = issuerDoc.verifyData(signedVc, new Identity.VerifierOptions({}));
			let validCredential = true;
			try {
				Identity.CredentialValidator.validate(
					signedVc as any,
					issuerDoc,
					Identity.CredentialValidationOptions.default(),
					Identity.FailFast.FirstError
				);
			} catch (e) {
				// if credential is revoked, validate will throw an error
				validCredential = false;
			}
			const verified = validCredential && credentialVerified;
			return verified;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not check the verifiable credential');
		}
	}

	async publishSignedDoc(newDoc: Identity.Document, key: Identity.KeyPair, prevMessageId: string): Promise<string> {
		newDoc.setMetadataPreviousMessageId(prevMessageId);
		newDoc.setMetadataUpdated(Identity.Timestamp.nowUTC());
		const methodId = newDoc.defaultSigningMethod().id().toString();
		newDoc.signSelf(key, methodId);
		const client = await this.getIdentityClient();
		const tx = await client.publishDocument(newDoc);
		return tx?.messageId();
	}

	async revokeVerifiableCredential(issuerIdentity: IdentityKeys, bitmapIndex: number, keyIndex: number): Promise<void> {
		try {
			const res = await this.restoreIdentity(issuerIdentity);
			const bitmapTag = `${this.config.bitmapTag}-${bitmapIndex}`; // caution this is without the did by purpose
			await res.doc.revokeCredentials(bitmapTag, keyIndex);
			await this.publishSignedDoc(res.doc, res.key, res.messageId);
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not revoke the verifiable credential');
		}
	}

	async getLatestIdentityJson(did: string): Promise<LatestIdentityJson> {
		try {
			const resolver = await Resolver.builder().clientConfig(this.getConfig(true)).build();
			const resolvedDoc = await resolver.resolve(did);

			if (!resolvedDoc) {
				throw Error(`no identity with id: ${did} found!`);
			}

			const messageId = resolvedDoc.integrationMessageId();

			return {
				document: resolvedDoc.document().toJSON(),
				messageId
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not get the latest identity');
		}
	}

	async getLatestIdentityDoc(did: string): Promise<{ doc: Identity.Document; messageId: string }> {
		try {
			const { document, messageId } = await this.getLatestIdentityJson(did);
			const doc = Document.fromJSON(document);
			if (!doc) {
				throw new Error('could not parse json');
			}
			return { doc, messageId };
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not get the latest identity');
		}
	}

	async getPublicKey(identityDoc: Identity.Document): Promise<string | undefined> {
		if (!identityDoc) {
			return;
		}
		const resolver = await Resolver.builder().clientConfig(this.getConfig(true)).build();
		const doc = await resolver.resolve(identityDoc.id());
		const methodId = doc.document().defaultSigningMethod().id().toString();
		const method = doc.intoDocument().resolveMethod(methodId);
		return method.toJSON().publicKeyMultibase;
	}

	async restoreIdentity(identity: IdentityKeys): Promise<{ doc: Identity.Document; key: Identity.KeyPair; messageId: string }> {
		try {
			const decodedKey = {
				public: Array.from(bs58.decode(identity.key.public)),
				secret: Array.from(bs58.decode(identity.key.secret))
			};
			const json = {
				type: identity.key.type,
				public: decodedKey.public,
				private: decodedKey.secret
			};
			const key: Identity.KeyPair = KeyPair.fromJSON(json);
			const { doc, messageId } = await this.getLatestIdentityDoc(identity.id);
			return {
				doc,
				key,
				messageId
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not parse key or doc of the identity');
		}
	}

	async generateIdentity(): Promise<{ account: Identity.Account; doc: Identity.Document; key: Identity.KeyPair }> {
		try {
			const builder = this.getAccountBuilder();
			const keyPair = new KeyPair(KeyType.Ed25519);
			const account = await builder.createIdentity({ privateKey: keyPair.private() });

			return {
				account,
				doc: account.document(),
				key: keyPair
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error(`could not create identity document from keytype: ${KeyType.Ed25519}`);
		}
	}
	getBitmapTag = (id: string, bitmapIndex: number) => `${id}#${this.config.bitmapTag}-${bitmapIndex}`;

	private getAccountBuilder(usePermaNode?: boolean): Identity.AccountBuilder {
		const clientConfig: Identity.IClientConfig = this.getConfig(usePermaNode);
		const builderOptions = {
			clientConfig
		};
		return new AccountBuilder(builderOptions);
	}

	private getIdentityClient(usePermaNode?: boolean) {
		const cfg: Identity.IClientConfig = this.getConfig(usePermaNode);
		return Client.fromConfig(cfg);
	}

	private getConfig(usePermaNode?: boolean): Identity.IClientConfig {
		return {
			permanodes: usePermaNode ? [{ url: this.config.permaNode }] : [],
			primaryNode: { url: this.config.node },
			network: Identity.Network.mainnet(),
			localPow: false
		};
	}
}
