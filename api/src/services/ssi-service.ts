import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import {
	DocumentJsonUpdate,
	IdentityDocument,
	IdentityDocumentJson,
	IdentityJson,
	IdentityJsonUpdate,
	VerifiableCredentialJson,
	Credential
} from '../models/types/identity';
import { KeyCollectionJson } from '../models/types/key-collection';
const { Document, VerifiableCredential, VerificationMethod, KeyCollection, Client } = Identity;
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
		issuerIdentity: IdentityJsonUpdate
	): Promise<{ docUpdate: DocumentJsonUpdate; keyCollectionJson: KeyCollectionJson }> {
		try {
			const { doc, key } = this.restoreIdentity(issuerIdentity);
			const keyCollection = new KeyCollection(this.config.keyType, keyCollectionSize);
			const publicKeyBase58 = keyCollection.merkleRoot(this.config.hashFunction);
			const method = VerificationMethod.createMerkleKey(
				this.config.hashFunction,
				doc.id,
				keyCollection,
				this.getKeyCollectionTag(keyCollectionIndex)
			);
			const newDoc = this.addPropertyToDoc(doc, { previousMessageId: issuerIdentity.txHash });

			newDoc.insertMethod(method, `VerificationMethod`);
			newDoc.sign(key);

			if (!newDoc.verify()) {
				throw new Error('could not add keycollection to the identity!');
			}

			const txHash = await this.publishSignedDoc(newDoc.toJSON());
			const { keys, type } = keyCollection?.toJSON();
			const keyCollectionJson: KeyCollectionJson = {
				type,
				keys,
				publicKeyBase58
			};
			return { docUpdate: { doc: newDoc.toJSON(), txHash }, keyCollectionJson };
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not generate the key collection');
		}
	}

	async createIdentity(): Promise<IdentityJsonUpdate> {
		try {
			const identity = this.generateIdentity();
			identity.doc.sign(identity.key);
			const txHash = await this.publishSignedDoc(identity.doc.toJSON());
			const identityIsVerified = identity.doc.verify();

			if (!identityIsVerified) {
				throw new Error('could not create the identity. Please try it again.');
			}

			return {
				doc: identity.doc.toJSON(),
				key: { ...identity.key.toJSON(), encoding: this.config.hashEncoding },
				txHash
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not create the identity');
		}
	}

	async createVerifiableCredential<T>(
		issuerIdentity: IdentityJson,
		credential: Credential<T>,
		keyCollectionJson: KeyCollectionJson,
		keyCollectionIndex: number,
		subjectKeyIndex: number
	): Promise<VerifiableCredentialJson> {
		try {
			const { doc } = this.restoreIdentity(issuerIdentity);
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

			const config = Identity.Config.fromNetwork(Identity.Network.mainnet());
			const client = Client.fromConfig(config);
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
			const credentialVerified = issuerDoc.verifyData(signedVc);
			const subjectIsVerified = subject.verify();
			const verified = issuerDoc.verify() && credentialVerified && subjectIsVerified;
			return verified;
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not check the verifiable credential');
		}
	}

	async publishSignedDoc(newDoc: IdentityDocumentJson): Promise<string> {
		const config = Identity.Config.fromNetwork(Identity.Network.mainnet());
		const client = Client.fromConfig(config);
		const txHash = await client.publishDocument(newDoc);
		return txHash;
	}

	async revokeVerifiableCredential(
		issuerIdentity: IdentityJsonUpdate,
		keyCollectionIndex: number,
		keyIndex: number
	): Promise<{ docUpdate: DocumentJsonUpdate; revoked: boolean }> {
		try {
			const { doc, key } = this.restoreIdentity(issuerIdentity);
			const newDoc = this.addPropertyToDoc(doc, { previousMessageId: issuerIdentity.txHash });
			const result: boolean = newDoc.revokeMerkleKey(this.getKeyCollectionTag(keyCollectionIndex), keyIndex);
			newDoc.sign(key);
			const txHash = await this.publishSignedDoc(newDoc.toJSON());

			return { docUpdate: { doc: newDoc.toJSON(), txHash }, revoked: result };
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error('could not revoke the verifiable credential');
		}
	}

	async getLatestIdentityJson(did: string): Promise<{ document: IdentityDocumentJson; messageId: string }> {
		try {
			const config = Identity.Config.fromNetwork(Identity.Network.mainnet());
			//config.setPrimaryNode('https://chrysalis-chronicle.iota.org:443');
			const client = Client.fromConfig(config);
			return await client.resolve(did);
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

	getPublicKey(identityDoc: Identity.Document): string | undefined {
		if (!identityDoc) {
			return;
		}
		const verificationMethod = identityDoc.resolveKey(`${identityDoc.id}#key`);
		return verificationMethod?.toJSON()?.publicKeyBase58;
	}

	restoreIdentity(identity: IdentityJson) {
		try {
			const key: Identity.KeyPair = Identity.KeyPair.fromJSON(identity.key);
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

	generateIdentity() {
		try {
			const { doc, key } = new Document(this.config.keyType, Identity.Network.mainnet().toString()) as IdentityDocument;

			return {
				doc,
				key
			};
		} catch (error) {
			this.logger.error(`Error from identity sdk: ${error}`);
			throw new Error(`could not create identity document from keytype: ${this.config.keyType}`);
		}
	}
	getKeyCollectionTag = (keyCollectionIndex: number) => `${this.config.keyCollectionTag}-${keyCollectionIndex}`;

	private addPropertyToDoc(doc: Identity.Document, property: { [key: string]: any }): Identity.Document {
		return Identity.Document.fromJSON({
			...doc.toJSON(),
			...property
		});
	}
}
