import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { VerifiableCredentialJson, Credential, KeyCollectionJson, IdentityKeys, LatestIdentityJson } from '@iota/is-shared-modules';
const { Document, Credential, Client, KeyPair, KeyType, Resolver, AccountBuilder } = Identity;
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

	async createRevocationBitmap(
		keyCollectionIndex: number,
		_keyCollectionSize: number,
		issuerIdentity: {
			id: string;
			key: Identity.KeyPair;
		}
	): Promise<void> {
		try {
			console.log('AAAAA');
			const { doc, messageId } = await this.getLatestIdentityDoc(issuerIdentity.id);
			const key = issuerIdentity.key;
			console.log('BBBB');
			const revocationBitmap = new Identity.RevocationBitmap();
			console.log('cccc');
			const service = new Identity.Service({
				id: this.getBitmapTag(issuerIdentity.id, keyCollectionIndex),
				serviceEndpoint: revocationBitmap.toEndpoint(),
				type: Identity.RevocationBitmap.type()
			});
			console.log('ddddd');
			doc.insertService(service);
			console.log('eeeee');

			doc.setMetadataPreviousMessageId(messageId);
			doc.setMetadataUpdated(Identity.Timestamp.nowUTC());

			doc.signSelf(key, doc.defaultSigningMethod().id());
			console.log('doooooc', doc.toJSON());
			await this.publishSignedDoc(doc);
			/*
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
			newDoc.signSelf(key, '');
			newDoc.verifyDocument(newDoc);

			await this.publishSignedDoc(newDoc.toJSON());
			const { keys, type } = keyCollection?.toJSON();
			const keyCollectionJson: KeyCollectionJson = {
				type,
				keys,
				publicKeyBase58
			};
			return { keyCollectionJson };*/
		} catch (error) {
			console.log('ERROR:', error);
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not generate the key collection');
		}
	}

	async createIdentity(): Promise<{ doc: Identity.Document; key: Identity.KeyPair }> {
		try {
			const identity = await this.generateIdentity();

			return {
				doc: identity.doc,
				key: identity.key
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the identity');
		}
	}

	async createVerifiableCredential<T>(
		_issuerIdentity: IdentityKeys,
		_credential: Credential<T>,
		_keyCollectionJson: KeyCollectionJson,
		_keyCollectionIndex: number,
		_subjectKeyIndex: number
	): Promise<VerifiableCredentialJson> {
		try {
			throw Error('NOTIMPLMEMENTED');
			/*const { document } = await this.getLatestIdentityJson(issuerIdentity.id);

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

			return validatedCredential.credential;*/
			return null;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the verifiable credential');
		}
	}

	async checkVerifiableCredential(signedVc: VerifiableCredentialJson): Promise<boolean> {
		try {
			const issuerDoc = (await this.getLatestIdentityDoc(signedVc.issuer)).doc;
			const subject = (await this.getLatestIdentityDoc(signedVc.id)).doc;
			const credentialVerified = issuerDoc.verifyData(signedVc, new Identity.VerifierOptions({}));
			subject.verifyDocument(subject);
			issuerDoc.verifyDocument(issuerDoc);
			const verified = credentialVerified;
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
		_issuerIdentity: IdentityKeys,
		_keyCollectionIndex: number,
		_keyIndex: number
	): Promise<{ revoked: boolean }> {
		try {
			throw Error('NOTIMPLMEMENTED');
			/*const { document, messageId } = await this.getLatestIdentityJson(issuerIdentity.id);
			const { doc, key } = this.restoreIdentity({ doc: document, key: issuerIdentity.key });
			const newDoc = this.addPropertyToDoc(doc, { previousMessageId: messageId });
			const result: boolean = newDoc.revokeMerkleKey(this.getKeyCollectionTag(keyCollectionIndex), keyIndex);

			newDoc.sign(key);
			await this.publishSignedDoc(newDoc.toJSON());

			return { revoked: result };*/
			return null;
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
		const resolver = await Resolver.builder().clientConfig(this.getConfig()).build();
		const doc = await resolver.resolve(identityDoc.id());
		const id = identityDoc.id().toString();
		const method = doc.intoDocument().resolveMethod(`${id}#sign-0`);
		return method.toJSON().publicKeyMultibase;
	}

	async restoreIdentity(identity: IdentityKeys): Promise<{ doc: Identity.Document; key: Identity.KeyPair }> {
		try {
			const key: Identity.KeyPair = KeyPair.fromJSON(identity.key);
			const { doc } = await this.getLatestIdentityDoc(identity.id);

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
			throw new Error(`could not create identity document from keytype: ${KeyType.Ed25519}`);
		}
	}
	getBitmapTag = (id: string, keyCollectionIndex: number) => `${id}#${this.config.bitmapTag}-${keyCollectionIndex}`;

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

	/*private addPropertyToDoc(doc: Identity.Document, property: { [key: string]: any }): Identity.Document {
		return Identity.Document.fromJSON({
			...doc.toJSON(),
			...property
		});
	}*/
}
