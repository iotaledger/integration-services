import * as ed from '@noble/ed25519';
import axios, { AxiosInstance } from 'axios';
import { Base58, Converter } from '@iota/util.js';
import { Sha256 } from '@iota/crypto.js';

import { ApiVersion } from '../models/apiVersion';
import { ClientConfig } from '../models/clientConfig';

/**
 * This is the base client used as a parent class for all clients
 * using the integration services api.
 */
export abstract class BaseClient {
  apiKey: string;
  isGatewayUrl?: string;
  auditTrailUrl?: string;
  ssiBridgeUrl?: string;
  jwtToken?: string;
  instance: AxiosInstance;

  // Default config is a local api without an api key
  constructor({
    apiKey,
    isGatewayUrl,
    ssiBridgeUrl,
    auditTrailUrl,
    apiVersion
  }: ClientConfig = {}) {
    this.apiKey = apiKey || '';

    this.buildUrls(isGatewayUrl, ssiBridgeUrl, auditTrailUrl, apiVersion);

    // Configure request timeout to 2 min because tangle might be slow
    this.instance = axios.create({
      timeout: 120000
    });
  }

  buildUrls(
    isGatewayUrl?: string,
    ssiBridgeUrl?: string,
    auditTrailUrl?: string,
    apiVersion = ApiVersion.v01
  ) {
    if (isGatewayUrl && (ssiBridgeUrl || auditTrailUrl)) {
      throw new Error('Define either a isGatewayUrl or ssiBridgeUrl and auditTrailUrl.');
    }

    this.isGatewayUrl = isGatewayUrl && `${isGatewayUrl}/api/${apiVersion}`;

    this.auditTrailUrl = auditTrailUrl
      ? `${auditTrailUrl}/api/${apiVersion}`
      : `http://127.0.0.1:3002/api/${apiVersion}`;

    this.ssiBridgeUrl = ssiBridgeUrl
      ? `${ssiBridgeUrl}/api/${apiVersion}`
      : `http://127.0.0.1:3001/api/${apiVersion}`;
  }

  /**
   * Authenticates the user to the api for requests where authentication is needed
   * @param id of the user to authenticate
   * @param secretKey of the user to authenticate
   */
  async authenticate(id: string, secretKey: string) {
    const url = this.isGatewayUrl ? this.isGatewayUrl : this.ssiBridgeUrl;
    const body = await this.get(`${url}/authentication/prove-ownership/${id}`);
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

  async get(url: string, params: any = {}) {
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
