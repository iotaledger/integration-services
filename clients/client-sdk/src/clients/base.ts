import * as ed from '@noble/ed25519';
import axios, { AxiosInstance } from 'axios';
import { Base58, Converter } from '@iota/util.js';
import { Sha256 } from '@iota/crypto.js';

import { ClientConfig } from '../models/clientConfig';

/**
 * This is the base client used as a parent class for all clients
 * using the integration services api.
 */
export abstract class BaseClient {
  apiKey: string;
  isGatewayUrl: string;
  useGatewayUrl?: boolean;
  auditTrailUrl?: string;
  ssiBridgeUrl?: string;
  apiVersionAuditTrail!: string;
  apiVersionSsiBridge!: string;
  jwtToken?: string;
  instance: AxiosInstance;

  // Default config is a local api without an api key
  constructor({
    apiKey,
    ssiBridgeUrl = '',
    auditTrailUrl = '',
    isGatewayUrl = '',
    apiVersionAuditTrail = '',
    apiVersionSsiBridge = '',
    useGatewayUrl = true,
  }: ClientConfig) {
    this.apiKey = apiKey || '';
    this.useGatewayUrl = useGatewayUrl;
    this.buildUrls(useGatewayUrl, ssiBridgeUrl, auditTrailUrl, apiVersionAuditTrail, apiVersionSsiBridge);
    this.isGatewayUrl = isGatewayUrl;
    // Configure request timeout to 2 min because tangle might be slow
    this.instance = axios.create({
      timeout: 120000
    });
  }

  buildUrls(
    useGatewayUrl?: boolean,
    ssiBridgeUrl?: string,
    auditTrailUrl?: string,
    apiVersionAuditTrail?: string,
    apiVersionSsiBridge?: string,
  ) {
    if (!useGatewayUrl && (!ssiBridgeUrl || !auditTrailUrl)) {
      throw new Error(
        'Define a gatewayUrl or unset useGatewayUrl and use ssiBridgeUrl and auditTrailUrl'
      );
    }
    if( !apiVersionAuditTrail || !apiVersionSsiBridge) {
      throw new Error(
        'Set the api version for apiVersionAuditTrail and apiVersionSsiBridge'
      )
    }
    this.auditTrailUrl = auditTrailUrl && auditTrailUrl;

    this.ssiBridgeUrl = ssiBridgeUrl && ssiBridgeUrl;
  }

  /**
   * Authenticates the user to the api for requests where authentication is needed
   * @param id of the user to authenticate
   * @param secretKey of the user to authenticate
   */
  async authenticate(id: string, secretKey: string) {
    if(!secretKey){
      throw new Error('No private signature key provided.')
    }
    const url: string = this.useGatewayUrl ? this.isGatewayUrl!! : this.ssiBridgeUrl!!;
    const body = await this.get(`${url}/api/${this.apiVersionSsiBridge}/authentication/prove-ownership/${id}`);
    const nonce = body?.nonce;
    const encodedKey = await this.getHexEncodedKey(secretKey);
    const signedNonce = await this.signNonce(encodedKey, nonce);
    const { jwt } = await this.post(`${url}/authentication/prove-ownership/${id}`, {
      signedNonce
    });
    this.jwtToken = jwt;
  }

  async signNonce(privateKey: string, nonce: string): Promise<string> {
    if (nonce?.length !== 40) {
      throw new Error('nonce must have a length of 40 characters!');
    }
    const hash = await this.hashNonce(nonce);
    const signedHash = await ed.sign(hash, privateKey);
    return ed.Signature.fromHex(signedHash).toHex();
  }

  hashNonce(nonce: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(nonce);
    const hash = new Sha256(256).update(data);
    return Converter.bytesToHex(hash.digest());
  }

  getHexEncodedKey(base58Key: string) {
    return Converter.bytesToHex(Base58.decode(base58Key));
  }

  async post(url: string, data: any) {
    let response = await this.instance.request({
      method: 'post',
      url,
      params: {
        'api-key': this.apiKey
      },
      data,
      headers: this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {}
    });
    return response?.data;
  }

  async get(url: string, params: any = {}, data: any = {}) {
    params['api-key'] = this.apiKey;
    let response = await this.instance.request({
      method: 'get',
      url,
      params,
      headers: this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {}
    });
    return response?.data;
  }

  async delete(url: string, params: any = {}) {
    params['api-key'] = this.apiKey;
    let response = await this.instance.request({
      method: 'delete',
      url,
      params,
      headers: this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {}
    });
    return response?.data;
  }

  async put(url: string, data: any) {
    let response = await this.instance.request({
      method: 'put',
      url,
      params: {
        'api-key': this.apiKey
      },
      data,
      headers: this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {}
    });
    return response?.data;
  }
}
