import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { IdentityDocument, IdentityResponse } from '../models/data/identity';
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
    issuerIdentity: IdentityResponse,
    index: number,
    count = 8
  ): Promise<{ doc: Identity.Document; kcp: KeyCollectionPersistence }> => {
    if (count > 20) {
      throw new Error('Key collection count is too big!');
    }
    const { doc, key } = this.restoreIdentity(issuerIdentity);
    const keyCollection = new KeyCollection(this.config.keyType, count);
    const method = Method.createMerkleKey(this.config.hashFunction, doc.id, keyCollection, this.config.keyCollectionTag);

    doc.insertMethod(method, `VerificationMethod`);
    doc.sign(key);

    console.log('Verified (doc): ', doc.verify());

    const txHash = await Identity.publish(doc.toJSON(), this.config);
    // TODO update server doc
    console.log('NEW DOC ', doc);
    console.log('txHash ', txHash);

    const { keys, type } = keyCollection?.toJSON();
    const kcp = {
      count,
      index,
      type,
      keys
    };
    return { doc, kcp };
  };

  createIdentity = async (): Promise<IdentityResponse> => {
    const identity = this.generateIdentity();
    identity.doc.sign(identity.key);
    const txHash = await Identity.publish(identity.doc.toJSON(), this.config);
    const identityIsVerified = identity.doc.verify();

    if (!identityIsVerified) {
      throw new Error('Could not create the identity. Please try it again.');
    }

    return {
      doc: identity.doc.toJSON(),
      key: identity.key.toJSON(),
      explorerUrl: `${this.config.explorer}/${txHash}`,
      txHash
    };
  };

  createVerifiableCredential = async <T>(
    issuerIdentity: IdentityResponse,
    credential: Credential<T>,
    keyCollectionJson: KeyCollectionJson,
    subjectKeyIndex: number
  ): Promise<{ newIdentityDoc: IdentityDocument; validatedCredential: any }> => {
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

    return { newIdentityDoc: doc, validatedCredential };
  };

  checkVerifiableCredential = async (issuerIdentity: IdentityResponse, signedVc: any): Promise<any> => {
    const { doc } = this.restoreIdentity(issuerIdentity);
    console.log('Verified (credential)', doc.verify(signedVc));
    const validatedCredential = await Identity.checkCredential(JSON.stringify(signedVc), this.config);

    if (!validatedCredential.verified) {
      console.log(`Verifiable credential is not verified for: ${signedVc?.id}!`);
    }

    return validatedCredential;
  };

  revokeVerifiableCredential = async (
    issuerIdentity: IdentityResponse,
    index: number
  ): Promise<{ newIdentityDoc: Identity.Document; revoked: boolean }> => {
    const { doc, key } = this.restoreIdentity(issuerIdentity);
    // what is this result saying?
    const result: boolean = doc.revokeMerkleKey(this.config.keyCollectionTag, index);
    const newDoc = Identity.Document.fromJSON({
      previous_message_id: issuerIdentity.txHash,
      ...doc.toJSON()
    });

    newDoc.sign(key);
    const txHash = await Identity.publish(newDoc.toJSON(), this.config);

    // TODO update server doc!
    console.log('New Server Identity:,', JSON.stringify(newDoc));
    console.log('Publish Server Identity: at hash:' + txHash);
    return { newIdentityDoc: newDoc, revoked: result };
  };

  getLatestIdentity = async (did: string) => {
    return Identity.resolve(did, this.config);
  };

  restoreIdentity = (issuerIdentity: any) => {
    const key: Identity.KeyPair = Identity.KeyPair.fromJSON(issuerIdentity.key);
    const doc = Document.fromJSON(issuerIdentity.doc) as any;

    return {
      doc,
      key
    };
  };

  generateIdentity = () => {
    const { doc, key } = new Document(this.config.keyType) as IdentityDocument;

    return {
      doc,
      key
    };
  };
}
