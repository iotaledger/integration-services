import * as Identity from '@iota/identity-wasm/node';
import { IdentityConfig } from '../models/config';
import { IdentityDocument, IdentityResponse } from '../models/data/identity';
const { Document, VerifiableCredential, Digest, Method } = Identity;
import { SERVER_IDENTITY, SERVER_KEY_COLLECTION } from '../config/identity';
import { User } from '../models/data/user';
export interface Credential<T> {
  id: string;
  type: string;
  subject: T;
}

const ServerIdentity = SERVER_IDENTITY;
const ServerKeyCollection = SERVER_KEY_COLLECTION;
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

  createIdentity = async (): Promise<IdentityResponse> => {
    const identity = this.generateIdentity();
    identity.doc.sign(identity.key);
    const txHash = await Identity.publish(identity.doc.toJSON(), this.config);
    const identityIsVerified = identity.doc.verify();

    if (!identityIsVerified) {
      throw new Error('Could not create the identity. Please try it again.');
    }

    return {
      doc: identity.doc,
      key: identity.key,
      explorerUrl: `${this.config.explorer}/${txHash}`,
      txHash
    };
  };

  createVerifiableCredential = async <T>(credential: Credential<T>): Promise<any> => {
    console.log('SERVER_IDENTITY', SERVER_IDENTITY);

    const issuerIdentity = ServerIdentity;
    const issuerKeyCollection = ServerKeyCollection;
    const { doc } = this.restoreIdentity(issuerIdentity);
    const issuerKeys = Identity.KeyCollection.fromJSON(issuerKeyCollection);
    const subjectKeyIndex = 5;
    const method = Method.createMerkleKey(Digest.Sha256, doc.id, issuerKeys, 'key-collection');
    console.log('METHOOOODMAN', method.id.toString());

    const credentialSubject = {
      ...credential.subject
    };

    // Issue an unsigned `UniversityDegree` credential for Alice
    const unsignedVc = VerifiableCredential.extend({
      id: credential?.id,
      type: credential.type,
      issuer: doc.id.toString(),
      credentialSubject
    });

    // Sign the credential with Bob's Merkle Key Collection method
    const signedVc = doc.signCredential(unsignedVc, {
      method: method.id.toString(),
      public: issuerKeys.public(subjectKeyIndex),
      secret: issuerKeys.secret(subjectKeyIndex),
      proof: issuerKeys.merkleProof(Digest.Sha256, subjectKeyIndex)
    });

    // Ensure the credential signature is valid
    console.log('Verifiable Credential', signedVc);
    console.log('Verified (credential)', doc.verify(signedVc));
    if (!doc.verify(signedVc)) {
      throw new Error('could not verify signed identity. Please try it again.');
    }

    // Check the validation status of the Verifiable Credential
    const validatedCredential = await Identity.checkCredential(signedVc.toString(), this.config);
    console.log('Credential Validation', validatedCredential);

    return validatedCredential;
  };

  checkVerifiableCredential = async (signedVc: any): Promise<any> => {
    // Check the validation status of the Verifiable Credential
    console.log('VCCCCC', signedVc);
    const validatedCredential = await Identity.checkCredential(JSON.stringify(signedVc), this.config);
    console.log('Credential Validation', JSON.stringify(validatedCredential));

    if (!validatedCredential.verified) {
      console.error(`Verifiable credential cannot be verified for ${'TODO'}!`);
    }

    return validatedCredential;
  };

  revokeVerifiableCredential = async (user: User): Promise<any> => {
    // Check the validation status of the Verifiable Credential
    const issuerIdentity = ServerIdentity;
    const { doc } = this.restoreIdentity(issuerIdentity);
    const res = doc.revokeMerkleKey('key-collection', 5);
    console.log('REVOKKE', res);

    return {};
  };

  restoreIdentity = (issuerIdentity: any) => {
    const keyPair: Identity.KeyPair = issuerIdentity.key;
    const doc = Document.fromJSON(issuerIdentity.doc) as any;

    return {
      doc: doc,
      key: keyPair
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
/*
subject:
{
    "doc": {
        "id": "did:iota:9e7mbNZr1zh1hAVS4a8MZHdsJUjyP1pud66vRn8m8PnJ",
        "authentication": [
            {
                "id": "did:iota:9e7mbNZr1zh1hAVS4a8MZHdsJUjyP1pud66vRn8m8PnJ#key",
                "controller": "did:iota:9e7mbNZr1zh1hAVS4a8MZHdsJUjyP1pud66vRn8m8PnJ",
                "type": "Ed25519VerificationKey2018",
                "publicKeyBase58": "DTmUqkg3yGPF4WixVx8ekXy3KRsEno1hT59qYcyst7sT"
            }
        ],
        "created": "2021-02-26T13:43:58Z",
        "updated": "2021-02-26T13:43:58Z",
        "immutable": false,
        "proof": {
            "type": "JcsEd25519Signature2020",
            "verificationMethod": "#key",
            "signatureValue": "2uUXsNyMPXRRaQgCeztjHaBp3oUkvkDvjx1VxXa1Ct1nM17zsjVdsCpZniSGwcCYFqgTix2DMZS9viu9zrketHSu"
        }
    },
    "key": {
        "type": "ed25519",
        "public": "DTmUqkg3yGPF4WixVx8ekXy3KRsEno1hT59qYcyst7sT",
        "secret": "6Exro835JvMGQS4wHX7GCx8baujumzcQAViLCEucozdv"
    },
    "explorerUrl": "https://explorer.iota.org/mainnet/transaction/AWEIIZDXPFQZOXAPKYQYLFWVJHWNRBFOCLKCCDNVPTLSICXKPIKRZJPYJKKBLRFOMGAJPDIWCXVFZ9999",
    "txHash": "AWEIIZDXPFQZOXAPKYQYLFWVJHWNRBFOCLKCCDNVPTLSICXKPIKRZJPYJKKBLRFOMGAJPDIWCXVFZ9999"
}


issuer:

{
  "doc": {
      "id": "did:iota:BcMaBDKuWfH2nx7koZgB5yd3p8UscbxvCCuk4SDbDVFk",
      "authentication": [
          {
              "id": "did:iota:BcMaBDKuWfH2nx7koZgB5yd3p8UscbxvCCuk4SDbDVFk#key",
              "controller": "did:iota:BcMaBDKuWfH2nx7koZgB5yd3p8UscbxvCCuk4SDbDVFk",
              "type": "Ed25519VerificationKey2018",
              "publicKeyBase58": "BnUn8gRZAavPYnuUFttLiwQBsD6UXHkhMaR6z5PfHZVH"
          }
      ],
      "created": "2021-02-26T09:39:20Z",
      "updated": "2021-02-26T09:39:20Z",
      "immutable": false,
      "proof": {
          "type": "JcsEd25519Signature2020",
          "verificationMethod": "#key",
          "signatureValue": "29zTu12XKLM89TeXEX7ceC4GxLNJA1fKa1SKzTPvnMdP5fcpjq8wCEze7vrAGmEmVGA6HNs2cjmXaKF1XLenVBMC"
      }
  },
  "key": {
      "type": "ed25519",
      "public": "BnUn8gRZAavPYnuUFttLiwQBsD6UXHkhMaR6z5PfHZVH",
      "secret": "GDVbu12vs6yKNHo5bpoyYn2KP4aByLKzoKVbTH2xGGWB"
  },
  "explorerUrl": "https://explorer.iota.org/mainnet/transaction/DTELDOCXQWCDKWKWLXHAFZLCSEAJKOLUSIILJOQSM9AKGVBMDIJLGHLWQRGJOSIHCZMHPBWGY9RI99999",
  "txHash": "DTELDOCXQWCDKWKWLXHAFZLCSEAJKOLUSIILJOQSM9AKGVBMDIJLGHLWQRGJOSIHCZMHPBWGY9RI99999"

}*/
