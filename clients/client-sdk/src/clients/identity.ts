import { BaseClient } from './base';
import { ClientConfig } from '../models/clientConfig';
import {
  VerifiableCredential,
  RevokeVerificationBody,
  VerifyJwtBody,
  User,
  UserType,
  CredentialTypes,
  VerifiableCredentialInternal,
  IdentityDocument,
  IdentityKeys,
  UserSearchResponse
} from '@iota/is-shared-modules';
import { SearchCriteria } from '../models/searchCriteria';
import * as bs58 from 'bs58';
import {
  Credential,
  CredentialValidationOptions,
  Duration,
  Document,
  KeyPair,
  FailFast,
  Presentation,
  PresentationValidationOptions,
  Resolver,
  Network,
  SubjectHolderRelationship,
  Timestamp,
  IPresentation,
  VerifierOptions,
  IClientConfig,
  ProofOptions
} from '@iota/identity-wasm/node';

export class IdentityClient extends BaseClient {
  private baseUrl: string;

  constructor(config: ClientConfig) {
    super(config);
    this.baseUrl = this.useGatewayUrl ? this.isGatewayUrl!! : this.ssiBridgeUrl!!;
  }

  /**
   * Create a new decentralized digital identity (DID). Identity DID document is signed and published to the ledger (IOTA Tangle). A digital identity can represent an individual, an organization or an object. The privateAuthKey controlling the identity is returned. It is recommended to securely (encrypt) store the privateAuthKey locally, since it is not stored on the APIs Bridge.
   * @param username
   * @param claimType defaults to UserType.Person
   * @param claim
   * @param hidden
   * @returns
   */
  async create(
    username?: string,
    claimType = UserType.Person,
    claim?: any,
    hidden?: boolean
  ): Promise<IdentityKeys> {
    return await this.post(`${this.baseUrl}/identities/create`, {
      username,
      hidden,
      claim: {
        ...claim,
        type: claimType
      }
    });
  }

  /**
   * Search for identities in the system and returns a list of existing identities.
   * @param username
   * @returns
   */
  async search({
    type,
    username,
    creator,
    registrationDate,
    asc,
    limit,
    index
  }: SearchCriteria): Promise<UserSearchResponse[]> {
    const param = registrationDate != undefined ? { 'registration-date': registrationDate } : {};
    return await this.get(`${this.baseUrl}/identities/search`, {
      type,
      username,
      creator,
      ...param,
      asc,
      limit,
      index
    });
  }

  /**
   * Get information (including attached credentials) about a specific identity using the identity-id (DID identifier).
   * @param id
   * @returns
   */
  async find(id: string): Promise<User> {
    return await this.get(`${this.baseUrl}/identities/identity/${id}`, {});
  }

  /**
   * Register an existing identity into the Bridge. This can be used if the identity already exists or it was only created locally. Registering an identity in the Bridge makes it possible to search for it by using some of the identity attributes, i.e., the username.
   * @param identity
   * @returns
   */
  async add(identity: User): Promise<null> {
    return this.post(`${this.baseUrl}/identities/identity`, identity);
  }

  /**
   * Update claim of a registered identity.
   * @param identity
   * @returns
   */
  async update(identity: User): Promise<null> {
    return this.put(`${this.baseUrl}/identities/identity`, identity);
  }

  /**
   * Removes an identity from the Bridge. An identity can only delete itself and is not able to delete other identities. Administrators are able to remove other identities. The identity cannot be removed from the immutable IOTA Tangle but only at the Bridge. Also the identity credentials will remain and the identity is still able to interact with other bridges.
   * @param id
   * @param revokeCredentials
   * @returns Null
   */
  async remove(id: string, revokeCredentials: boolean = false): Promise<null> {
    return this.delete(`${this.baseUrl}/identities/identity/${id}`, {
      'revoke-credentials': revokeCredentials
    });
  }

  private async restoreIdentity(
    identity: IdentityKeys
  ): Promise<{ document: Document; key: KeyPair; messageId: string }> {
    try {
      const decodedKey = {
        public: Array.from(bs58.decode(identity.keys.sign.public)),
        secret: Array.from(bs58.decode(identity.keys.sign.private))
      };
      const json = {
        type: identity.keys.sign.type,
        public: decodedKey.public,
        private: decodedKey.secret
      };
      const key: KeyPair = KeyPair.fromJSON(json);
      const { document, messageId } = await this.latestDocument(identity.id);
      return {
        document: Document.fromJSON(document),
        key,
        messageId
      };
    } catch (error) {
      console.error(`Error from identity sdk: ${error}`);
      throw new Error('could not parse key or doc of the identity');
    }
  }
  /**
   * Create a Verifiable Presentation.
   *
   * @param {{
   *     signedVcJson: any;
   *     identityKeys: IdentityKeys;
   *     challenge?: string;
   *     expiration?: number;
   *   }} props Properties
   * @param signedVcJson: Signed Verifiable Credential.
   * @param identityKeys: Identity keys to sign the Verifiable Presentation.
   * @param challenge: Challenge to mitigate replay attacks.
   * @param expiration: Time when the presentation shall expire in seconds.
   * @return {*}  {Promise<void>}
   * @memberof IdentityClient
   */
  async createVerifiablePresentation(props: {
    signedVcJson: any | any[];
    identityKeys: IdentityKeys;
    challenge?: string;
    expiration?: number;
  }): Promise<void> {
    const { signedVcJson, identityKeys, challenge, expiration } = props;
    const expires =
      expiration != null ? Timestamp.nowUTC().checkedAdd(Duration.seconds(expiration)) : undefined;
    const identity = await this.restoreIdentity(identityKeys);

    let receivedVC: Credential | Credential[];
    if (Array.isArray(signedVcJson)) {
      receivedVC = signedVcJson.map((vc) => Credential.fromJSON(vc));
    } else {
      receivedVC = Credential.fromJSON(signedVcJson);
    }

    const pres: IPresentation = {
      verifiableCredential: receivedVC,
      holder: identity.document.id()
    };

    const unsignedVp = new Presentation(pres);
    const methodId = identity.document.defaultSigningMethod().id().toString();
    const signedVp = await identity.document.signPresentation(
      unsignedVp,
      identity.key.private(),
      methodId,
      new ProofOptions({
        challenge,
        expires
      })
    );

    return signedVp.toJSON();
  }

  /**
   * Get the latest version of an identity document (DID) from the IOTA Tangle.
   * @param id
   * @returns
   */
  async latestDocument(id: string): Promise<{ document: IdentityDocument; messageId: string }> {
    return await this.get(`${this.baseUrl}/verification/latest-document/${id}`);
  }

  /**
   * Adds Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.
   * @param trustedAuthority
   * @returns
   */
  async addTrustedAuthority(trustedRootId: string): Promise<null> {
    return await this.post(`${this.baseUrl}/verification/trusted-roots`, { trustedRootId });
  }

  /**
   * Returns a list of Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.
   * @returns
   */
  async getTrustedAuthorities(): Promise<string[]> {
    return await this.get(`${this.baseUrl}/verification/trusted-roots`);
  }

  /**
   * Remove Trusted Root identity identifiers (DIDs). Trusted roots are DIDs of identities which are trusted by the Bridge. This identity DIDs can be DIDs of other organizations. By adding them to the list Trusted Roots their Verifiable Credentials (VCs) are automatically trusted when checking at the Bridge.
   * @param trustedAuthorityId
   * @returns
   */
  async removeTrustedAuthority(trustedAuthorityId: string): Promise<null> {
    return await this.delete(
      `${this.baseUrl}/verification/trusted-roots/${trustedAuthorityId}`,
      {}
    );
  }

  /**
   * Verify the authenticity of an identity (of an individual, organization or object) and issue a credential stating the identity verification status. Only previously verified identities (based on a network of trust) with assigned privileges can verify other identities. Having a verified identity provides the opportunity for other identities to identify and verify a the entity they interact to.
   * @param initiatorVC
   * @param targetDid
   * @param claim
   * @returns
   */
  async createCredential(
    initiatorVC: VerifiableCredentialInternal | undefined,
    targetDid: string,
    credentialType: CredentialTypes | string,
    claimType: UserType,
    claim?: any
  ): Promise<VerifiableCredential> {
    let body = {
      subject: {
        id: targetDid,
        credentialType,
        claim: {
          type: claimType,
          ...claim
        }
      },
      initiatorVC: initiatorVC
    };
    return await this.post(`${this.baseUrl}/verification/create-credential`, body);
  }

  /**
   * Check the verifiable credential of an identity. Validates the signed verifiable credential against the Issuer information stored onto the IOTA Tangle and checks if the issuer identity (DID) contained in the credential is from a trusted root.
   * @param credential
   * @returns
   */
  async checkCredential(credential: VerifiableCredential): Promise<{ isVerified: boolean }> {
    return await this.post(`${this.baseUrl}/verification/check-credential`, credential);
  }

  /**
   * Revoke one specific verifiable credential of an identity. In the case of individual and organization identities the reason could be that the user has left the organization. Only organization admins (with verified identities) or the identity owner itself can do that.
   * @param credential
   * @returns
   */
  async revokeCredential(credential: RevokeVerificationBody): Promise<null> {
    return await this.post(`${this.baseUrl}/verification/revoke-credential`, credential);
  }

  /**
   * Check the verifiable credential of an identity. Validates the signed verifiable credential against the Issuer information stored onto the IOTA Tangle and checks if the issuer identity (DID) contained in the credential is from a trusted root.
   * @param credential
   * @returns
   */
  async verifyJwt(jwt: VerifyJwtBody): Promise<{ isValid: boolean; error?: string }> {
    return await this.post(`${this.baseUrl}/authentication/verify-jwt`, jwt);
  }
}
