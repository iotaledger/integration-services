import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { DocumentUpdate, IdentityDocument, IdentityDocumentJson, IdentityJson, IdentityUpdate } from '../models/data/identity';
import { KeyCollectionJson, KeyCollectionPersistence } from '../models/data/key-collection';
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
    issuerIdentity: IdentityUpdate,
    index: number,
    count: number
  ): Promise<{ docUpdate: DocumentUpdate; kcp: KeyCollectionPersistence }> => {
    try {
      if (count > 20) {
        throw new Error('Key collection count is too big!');
      }
      const { doc, key } = this.restoreIdentity(issuerIdentity);
      const keyCollection = new KeyCollection(this.config.keyType, count);
      const method = Method.createMerkleKey(this.config.hashFunction, doc.id, keyCollection, this.config.keyCollectionTag);
      console.log('prev hash', issuerIdentity.txHash);

      const newDoc = Identity.Document.fromJSON({
        ...doc.toJSON(),
        previous_message_id: issuerIdentity.txHash
      });

      newDoc.insertMethod(method, `VerificationMethod`);
      newDoc.sign(key);

      console.log('Verified (doc): ', newDoc.verify());

      const txHash = await Identity.publish(newDoc.toJSON(), this.config);
      console.log(`###### tx at: ${this.config.explorer}/${txHash}`);

      const { keys, type } = keyCollection?.toJSON();
      const kcp = {
        count,
        index,
        type,
        keys
      };
      return { docUpdate: { doc: newDoc.toJSON(), txHash }, kcp };
    } catch (error) {
      console.log('Error from identity sdk:', error);
      throw new Error('could not generate the key collection');
    }
  };

  createIdentity = async (): Promise<IdentityUpdate> => {
    try {
      const identity = this.generateIdentity();
      identity.doc.sign(identity.key);
      const txHash = await Identity.publish(identity.doc.toJSON(), this.config);
      const identityIsVerified = identity.doc.verify();
      console.log(`###### tx at: ${this.config.explorer}/${txHash}`);

      if (!identityIsVerified) {
        throw new Error('Could not create the identity. Please try it again.');
      }

      return {
        doc: identity.doc.toJSON(),
        key: identity.key.toJSON(),
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
  ): Promise<{ validatedCredential: any }> => {
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

      const signedVc = doc.signCredential(unsignedVc, {
        method: method.id.toString(),
        public: issuerKeys.public(subjectKeyIndex),
        secret: issuerKeys.secret(subjectKeyIndex),
        proof: issuerKeys.merkleProof(digest, subjectKeyIndex)
      });

      // Ensure the credential signature is valid
      console.log('Verifiable Credential', signedVc);
      console.log('Verified (credential)', doc.verify(signedVc));
      if (!doc.verify(signedVc)) {
        throw new Error('could not verify signed identity. Please try it again.');
      }

      const validatedCredential = await Identity.checkCredential(signedVc.toString(), this.config);
      console.log('Credential Validation', validatedCredential);

      return { validatedCredential };
    } catch (error) {
      console.log('Error from identity sdk:', error);
      throw new Error('could not create the verifiable credential');
    }
  };

  checkVerifiableCredential = async (issuerIdentity: IdentityJson, signedVc: any): Promise<any> => {
    try {
      const { doc } = this.restoreIdentity(issuerIdentity);
      console.log('Verified (credential)', doc.verify(signedVc));
      const validatedCredential = await Identity.checkCredential(JSON.stringify(signedVc), this.config);

      if (!validatedCredential.verified) {
        console.log(`Verifiable credential is not verified for: ${signedVc?.id}!`);
      }

      return validatedCredential;
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

  revokeVerifiableCredential = async (issuerIdentity: IdentityUpdate, index: number): Promise<{ docUpdate: DocumentUpdate; revoked: boolean }> => {
    try {
      const { doc, key } = this.restoreIdentity(issuerIdentity);

      const newDoc = Identity.Document.fromJSON({
        ...doc.toJSON(),
        previous_message_id: issuerIdentity.txHash
      });

      const result: boolean = newDoc.revokeMerkleKey(this.config.keyCollectionTag, index);
      newDoc.sign(key);
      const txHash = await Identity.publish(newDoc.toJSON(), this.config);

      console.log(`###### tx at: ${this.config.explorer}/${txHash}`);

      return { docUpdate: { doc: newDoc.toJSON(), txHash }, revoked: result };
    } catch (error) {
      console.log('Error from identity sdk:', error);
      throw new Error('could not revoke the verifiable credential');
    }
  };

  getLatestIdentity = async (did: string) => {
    try {
      return await Identity.resolve(did, this.config);
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
