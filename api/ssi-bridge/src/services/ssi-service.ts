import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import {
	IdentityDocumentJson,
	IdentityJson,
	VerifiableCredentialJson,
	Credential,
	KeyCollectionJson,
	IdentityKeys,
	LatestIdentityJson
} from '@iota/is-shared-modules';
const { Document, Credential, VerificationMethod, RevocationBitmap, Client, KeyPair, KeyType, Resolver, AccountBuilder } = Identity;
import { ILogger } from '../utils/logger';

export class SsiService {
	private static instance: SsiService;
	private constructor(private readonly config: IdentityConfig, private readonly logger: ILogger) {}

	public static getInstance(config: IdentityConfig, logger: ILogger): SsiService {
		if (!SsiService.instance) {
			SsiService.instance = new SsiService(config, logger);
		}
		return SsiService.instance;
	}

	async generateKeyCollection(
		keyCollectionIndex: number,
		keyCollectionSize: number,
		issuerIdentity: IdentityKeys
	): Promise<{ keyCollectionJson: KeyCollectionJson }> {
		try {
			const { document, messageId } = await this.getLatestIdentityJson(issuerIdentity.id);
			const { doc, key } = this.restoreIdentity({ doc: document, key: issuerIdentity.key });
			const keyCollection = new KeyCollection(this.config.keyType, keyCollectionSize);
			const publicKeyBase58 = keyCollection.merkleRoot(this.config.hashFunction);
			const method = VerificationMethod.createMerkleKey(
				this.config.hashFunction,
				doc.id,
				keyCollection,
				this.getKeyCollectionTag(keyCollectionIndex)
			);
			const newDoc = this.addPropertyToDoc(doc, { previousMessageId: messageId });

			newDoc.insertMethod(method, `VerificationMethod`);
			newDoc.sign(key);

			if (!newDoc.verify()) {
				throw new Error('could not add keycollection to the identity!');
			}

			await this.publishSignedDoc(newDoc.toJSON());
			const { keys, type } = keyCollection?.toJSON();
			const keyCollectionJson: KeyCollectionJson = {
				type,
				keys,
				publicKeyBase58
			};
			return { keyCollectionJson };
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not generate the key collection');
		}
	}

	async createIdentity(): Promise<IdentityJson> {
		try {
			const identity = await this.generateIdentity();
			//identity.account.publish()
			/*identity.doc.signSelf(identity.key,identity.doc.defaultSigningMethod().id());
			await this.publishSignedDoc(identity.doc.toJSON());
			const identityIsVerified = identity.doc.verifyDocument(x)

			if (!identityIsVerified) {
				throw new Error('could not create the identity. Please try it again.');
			}*/

			return {
				doc: identity.doc.toJSON(),
				key: { ...identity.key.toJSON(), encoding: this.config.hashEncoding }
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the identity');
		}
	}

	async createVerifiableCredential<T>(
		issuerIdentity: IdentityKeys,
		credential: Credential<T>,
		keyCollectionJson: KeyCollectionJson,
		keyCollectionIndex: number,
		subjectKeyIndex: number
	): Promise<VerifiableCredentialJson> {
		try {
			const { document } = await this.getLatestIdentityJson(issuerIdentity.id);

			const { doc } = this.restoreIdentity({ doc: document, key: issuerIdentity.key });
			const issuerKeys = Identity.KeyCollection.fromJSON(keyCollectionJson);
			const digest = this.config.hashFunction;
			const method = VerificationMethod.createMerkleKey(digest, doc.id, issuerKeys, this.getKeyCollectionTag(keyCollectionIndex));

			const unsignedVc = VerifiableCredential.extend({
				id: credential?.id,
				type: credential.type,
				issuer: doc.id.toString(),
				credentialSubject: credential.subject
			});

			const signedVc = await doc.signCredential(unsignedVc, {
				method: method.id.toString(),
				public: issuerKeys.public(subjectKeyIndex),
				secret: issuerKeys.secret(subjectKeyIndex),
				proof: issuerKeys.merkleProof(digest, subjectKeyIndex)
			});

			const client = this.getIdentityClient(true);
			const validatedCredential = await client.checkCredential(signedVc.toString());

			if (!validatedCredential?.verified || !doc.verify(signedVc)) {
				throw new Error('could not verify identity, please try it again.');
			}

			return validatedCredential.credential;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the verifiable credential');
		}
	}

	async checkVerifiableCredential(signedVc: VerifiableCredentialJson): Promise<boolean> {
		try {
			const issuerDoc = await this.getLatestIdentityDoc(signedVc.issuer);
			const subject = await this.getLatestIdentityDoc(signedVc.id);
			/*const credentialVerified = issuerDoc.verifyData(signedVc, new Identity.VerifierOptions({}));
			const subjectIsVerified = subject.verifyDocument(subject);
			const verified = issuerDoc.verifyDocument(issuerDoca) && credentialVerified && subjectIsVerified;
			return verified;*/
			const credentialVerified = issuerDoc.verifyData(signedVc);
			const subjectIsVerified = subject.verify();
			const verified = issuerDoc.verify() && credentialVerified && subjectIsVerified;
			return verified;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not check the verifiable credential');
		}
	}

	async publishSignedDoc(newDoc: Identity.Document): Promise<string> {
		const client = await this.getIdentityClient();
		const tx = await client.publishDocument(newDoc);
		return tx?.messageId();
	}

	async revokeVerifiableCredential(
		issuerIdentity: IdentityKeys,
		keyCollectionIndex: number,
		keyIndex: number
	): Promise<{ revoked: boolean }> {
		try {
			const { document, messageId } = await this.getLatestIdentityJson(issuerIdentity.id);
			const { doc, key } = this.restoreIdentity({ doc: document, key: issuerIdentity.key });
			const newDoc = this.addPropertyToDoc(doc, { previousMessageId: messageId });
			const result: boolean = newDoc.revokeMerkleKey(this.getKeyCollectionTag(keyCollectionIndex), keyIndex);

			newDoc.sign(key);
			await this.publishSignedDoc(newDoc.toJSON());

			return { revoked: result };
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not revoke the verifiable credential');
		}
	}

	async getLatestIdentityJson(did: string): Promise<LatestIdentityJson> {
		try {
			const resolver = await Resolver.builder().clientConfig(this.getConfig()).build();
			const resolvedDoc = await resolver.resolve(did);
			const messageId = resolvedDoc.integrationMessageId();
			console.log('messageIdmessageIdmessageId', messageId);

			return {
				document: resolvedDoc.document().toJSON(),
				messageId
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not get the latest identity');
		}
	}

	async getLatestIdentityDoc(did: string): Promise<Identity.Document> {
		try {
			const { document } = await this.getLatestIdentityJson(did);
			const doc = Document.fromJSON(document);
			if (!doc) {
				throw new Error('could not parse json');
			}
			return doc;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not get the latest identity');
		}
	}

	async getPublicKey(identityDoc: Identity.Document): Promise<string | undefined> {
		if (!identityDoc) {
			return;
		}
		const resolver = await Resolver.builder().clientConfig(this.getConfig()).build();
		const doc = await resolver.resolve(identityDoc.id());
		const verificationMethod = doc.intoDocument().resolveMethod(`${identityDoc.id}#key`);
		console.log('verificationMethod', verificationMethod);
		return verificationMethod?.toJSON()?.publicKeyBase58;
	}

	restoreIdentity(identity: IdentityJson) {
		try {
			const key: Identity.KeyPair = KeyPair.fromJSON(identity.key);
			const doc = Document.fromJSON(identity.doc) as any;

			return {
				doc,
				key
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
			throw new Error(`could not create identity document from keytype: ${this.config.keyType}`);
		}
	}
	getKeyCollectionTag = (keyCollectionIndex: number) => `${this.config.keyCollectionTag}-${keyCollectionIndex}`;

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
			localPow: true
		};
	}

	private addPropertyToDoc(doc: Identity.Document, property: { [key: string]: any }): Identity.Document {
		return Identity.Document.fromJSON({
			...doc.toJSON(),
			...property
		});
	}
}
