import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import {
	DocumentJsonUpdate,
	IdentityDocument,
	IdentityDocumentJson,
	IdentityJson,
	IdentityJsonUpdate,
	VerifiableCredentialJson
} from '../models/types/identity';
import { KeyCollectionJson } from '../models/types/key-collection';
const { Document, VerifiableCredential, Method, KeyCollection } = Identity;

export interface Credential<T> {
	id: string;
	type: string;
	subject: T;
}

export class IdentityService {
	private static instance: IdentityService;
	private readonly config: IdentityConfig;

	private constructor(config: IdentityConfig) {
		this.config = config;
	}

	public static getInstance(config: IdentityConfig): IdentityService {
		if (!IdentityService.instance) {
			IdentityService.instance = new IdentityService(config);
		}
		return IdentityService.instance;
	}

	generateKeyCollection = async (
		issuerIdentity: IdentityJsonUpdate,
		count: number
	): Promise<{ docUpdate: DocumentJsonUpdate; keyCollectionJson: KeyCollectionJson }> => {
		try {
			const { doc, key } = this.restoreIdentity(issuerIdentity);
			const keyCollection = new KeyCollection(this.config.keyType, count);
			const method = Method.createMerkleKey(this.config.hashFunction, doc.id, keyCollection, this.config.keyCollectionTag);
			const newDoc = Identity.Document.fromJSON({
				...doc.toJSON(),
				previous_message_id: issuerIdentity.txHash
			});

			newDoc.insertMethod(method, `VerificationMethod`);
			newDoc.sign(key);

			if (!newDoc.verify()) {
				throw new Error('could not add keycollection to the identity!');
			}

			const txHash = await this.publishSignedDoc(newDoc.toJSON());
			const { keys, type } = keyCollection?.toJSON();
			const keyCollectionJson = {
				type,
				keys
			};
			return { docUpdate: { doc: newDoc.toJSON(), txHash }, keyCollectionJson };
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could not generate the key collection');
		}
	};

	createIdentity = async (): Promise<IdentityJsonUpdate> => {
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
			console.log('Error from identity sdk:', error);
			throw new Error('could not create the identity');
		}
	};

	createVerifiableCredential = async <T>(
		issuerIdentity: IdentityJson,
		credential: Credential<T>,
		keyCollectionJson: KeyCollectionJson,
		subjectKeyIndex: number
	): Promise<VerifiableCredentialJson> => {
		try {
			const { doc } = this.restoreIdentity(issuerIdentity);
			const issuerKeys = Identity.KeyCollection.fromJSON(keyCollectionJson);
			const digest = this.config.hashFunction;
			const method = Method.createMerkleKey(digest, doc.id, issuerKeys, this.config.keyCollectionTag);

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
			const validatedCredential = await Identity.checkCredential(signedVc.toString(), this.config);

			if (!validatedCredential?.verified || !doc.verify(signedVc)) {
				throw new Error('could not verify identity, please try it again.');
			}

			return validatedCredential.credential;
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could not create the verifiable credential');
		}
	};

	checkVerifiableCredential = async (signedVc: VerifiableCredentialJson): Promise<boolean> => {
		try {
			const issuerDoc = await this.getLatestIdentityDoc(signedVc.issuer);
			const subject = await this.getLatestIdentityDoc(signedVc.id);
			const credentialVerified = issuerDoc.verifyData(signedVc);
			const subjectIsVerified = subject.verify();
			const verified = issuerDoc.verify() && credentialVerified && subjectIsVerified;
			return verified;
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could not check the verifiable credential');
		}
	};

	publishSignedDoc = async (newDoc: IdentityDocumentJson): Promise<string> => {
		const txHash = await Identity.publish(newDoc, this.config);
		console.log(`###### tx at: ${this.config.explorer}/${txHash}`);
		return txHash;
	};

	revokeVerifiableCredential = async (
		issuerIdentity: IdentityJsonUpdate,
		index: number
	): Promise<{ docUpdate: DocumentJsonUpdate; revoked: boolean }> => {
		try {
			const { doc, key } = this.restoreIdentity(issuerIdentity);
			const newDoc = Identity.Document.fromJSON({
				...doc.toJSON(),
				previous_message_id: issuerIdentity.txHash
			});
			const result: boolean = newDoc.revokeMerkleKey(this.config.keyCollectionTag, index);
			newDoc.sign(key);
			const txHash = await this.publishSignedDoc(newDoc.toJSON());

			return { docUpdate: { doc: newDoc.toJSON(), txHash }, revoked: result };
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could not revoke the verifiable credential');
		}
	};

	getLatestIdentityJson = async (did: string): Promise<IdentityDocumentJson> => {
		try {
			return await Identity.resolve(did, this.config);
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could get the latest identity');
		}
	};

	getLatestIdentityDoc = async (did: string): Promise<Identity.Document> => {
		try {
			const json = await Identity.resolve(did, this.config);
			const doc = Document.fromJSON(json) as any;
			if (!doc) {
				throw new Error('could not parse json');
			}
			return doc;
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could get the latest identity');
		}
	};

	restoreIdentity = (identity: IdentityJson) => {
		try {
			const key: Identity.KeyPair = Identity.KeyPair.fromJSON(identity.key);
			const doc = Document.fromJSON(identity.doc) as any;

			return {
				doc,
				key
			};
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error('could not parse key or doc of the identity');
		}
	};

	generateIdentity = () => {
		try {
			const { doc, key } = new Document(this.config.keyType) as IdentityDocument;

			return {
				doc,
				key
			};
		} catch (error) {
			console.log('Error from identity sdk:', error);
			throw new Error(`could not create identity document from keytype: ${this.config.keyType}`);
		}
	};
}
