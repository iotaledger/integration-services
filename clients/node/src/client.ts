import { Base } from "./base";
const crypto = require("crypto");
import * as ed from 'noble-ed25519';
import * as bs58 from 'bs58';

export class Client extends Base {

    private jwtToken?: string;

    constructor(apiKey: string, baseURL?: string, apiVersion?: string) {
        super(apiKey, baseURL, apiVersion)
    }

    async identityCreate(username: string, claim: any) {
        return await this.post("identities/create", {
            username,
            claim
        });
    }

    async identityFind(identityId: string) {
        return await this.get(`identities/identity/${identityId}`, {}, this.jwtToken)
    }

    async identitySearch(username: string) {
        return await this.get("identities/search", { username }, this.jwtToken)
    }

    async identityDelete(identityId: string, revokeCredentials: boolean = false) {
        return this.delete(`identities/identity/${identityId}`, { "revoke-credentials": true }, this.jwtToken)
    }

    async credentialVerify(credential: any) {
        return await this.post(`verification/check-credential`, credential);
    }

    async createCredential(initiatorVC: any, targetDid: string, claim: any) {
        let body = {
            "subject": {
                "identityId": targetDid,
                "credentialType": "VerifiedIdentityCredential",
                "claim": {
                    "type": "Person",
                    ...claim,
                }
            },
            initiatorVC: initiatorVC
        }
        return await this.post("verification/create-credential", body, this.jwtToken);
    }

    async authorize(identity: any) {
        const body = await this.get(`authentication/prove-ownership/${identity?.doc?.id}`)
        const nonce = body?.nonce;
        const encodedKey = await this.getHexEncodedKey(identity?.key?.secret);
        const signedNonce = await this.signNonce(encodedKey, nonce);
        const { jwt } = await this.post(`authentication/prove-ownership/${identity.doc.id}`, {
            signedNonce
        })
        this.jwtToken = jwt;
    };

    private async signNonce(privateKey: string, nonce: string) {
        if (nonce?.length !== 40) {
            throw new Error('nonce must have a length of 40 characters!');
        }
        const hash = await this.hashNonce(nonce);
        return await ed.sign(hash, privateKey);
    };

    private async hashNonce(nonce: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(nonce);
        return crypto.createHash("sha256").update(data).digest("hex");
    }

    private getHexEncodedKey(base58Key: string) {
        return bs58.decode(base58Key).toString('hex');
    }


}
