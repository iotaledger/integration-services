import { ClientConfig } from "../models/types/clientConfig";
const crypto = require("crypto");
import * as ed from 'noble-ed25519';
import * as bs58 from 'bs58';
import { ApiVersion } from "../models/enums";
import { IdentityInternal, IdentityJson } from "../models/types/identity";
const axios = require('axios').default;

export class Base {

    private apiKey: string;
    private baseUrl = "http://ensuresec.solutions.iota.org/";
    private apiVersion: ApiVersion;
    public static jwtToken?: string;

    constructor({apiKey, baseUrl, apiVersion}: ClientConfig) {
        this.apiKey = apiKey || "";
        this.baseUrl = baseUrl || "http://ensuresec.solutions.iota.org/";
        this.apiVersion = apiVersion || ApiVersion.v01
    }

    async authenticate(identity: IdentityJson) {
        const body = await this.get(`authentication/prove-ownership/${identity?.doc?.id}`)
        const nonce = body?.nonce;
        const encodedKey = await this.getHexEncodedKey(identity?.key?.secret);
        const signedNonce = await this.signNonce(encodedKey, nonce);
        const { jwt } = await this.post(`authentication/prove-ownership/${identity.doc.id}`, {
            signedNonce
        })
        Base.jwtToken = jwt;
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

    async post(url: string, data: any, jwtToken?: string) {
        let response = await axios.request({
            method: "post",
            url: `${this.baseUrl}/api/${this.apiVersion}/${url}`,
            params: {
                "api-key": this.apiKey
            },
            data,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

    async get(url: string, params: any = {}, jwtToken?: string) {
        params['api-key'] = this.apiKey;
        let response = await axios.request({
            method: "get",
            url: `${this.baseUrl}/api/${this.apiVersion}/${url}`,
            params,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

    async delete(url: string, params: any = {}, jwtToken?: string) {
        params['api-key'] = this.apiKey;
        let response = await axios.request({
            method: "delete",
            url: `${this.baseUrl}/api/${this.apiVersion}/${url}`,
            params,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

    async put(url: string, data: any, jwtToken?: string) {
        let response = await axios.request({
            method: "put",
            url: `${this.baseUrl}/api/${this.apiVersion}/${url}`,
            params: {
                "api-key": this.apiKey
            },
            data,
            headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {}
        });
        return response?.data;
    }

}
