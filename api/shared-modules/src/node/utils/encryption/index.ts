import * as crypto from 'crypto';
import * as ed from '@noble/ed25519';
import * as bs58 from 'bs58';

const secretLength = 32;

export const createNonce = (): string => {
	return crypto.randomBytes(20).toString('hex');
};

export const getHexEncodedKey = (base58Key: string): string => {
	return bs58.decode(base58Key).toString('hex');
};

const hashNonce = (nonce: string) => crypto.createHash('sha256').update(nonce).digest().toString('hex');

export const signNonce = async (privateKey: string, nonce: string): Promise<string> => {
	if (nonce?.length !== 40) {
		throw new Error('nonce must have a length of 40 characters!');
	}
	const hash = hashNonce(nonce);
	const signedHash = await ed.sign(hash, privateKey);
	return ed.Signature.fromHex(signedHash).toHex();
};

export const verifySignedNonce = async (publicKey: string, nonce: string, signature: string): Promise<boolean> => {
	if (nonce?.length !== 40 || signature?.length !== 128) {
		throw new Error('wrong length of nonce or signature!');
	}
	const hash = hashNonce(nonce);
	return await ed.verify(signature, hash, publicKey);
};

export const randomSecretKey = () => crypto.randomBytes(24).toString('base64');

export const encrypt = (message: string, secret: string): any => {
	if (secret.length !== 32) {
		throw Error('secret must have 32 characters!');
	}

	const algorithm = 'aes-256-ctr';
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(algorithm, secret, iv);
	const encryptedText = Buffer.concat([cipher.update(message), cipher.final()]);
	return `${iv.toString('hex')},${encryptedText.toString('hex')}`;
};

export const decrypt = (cipher: string, secret: string) => {
	if (secret.length !== 32) {
		throw Error('secret must have 32 characters!');
	}

	const algorithm = 'aes-256-ctr';
	const splitted = cipher.split(',');
	const iv = splitted[0];
	const hash = splitted[1];
	const decipher = crypto.createDecipheriv(algorithm, secret, Buffer.from(iv, 'hex'));
	const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
	return decrpyted.toString();
};

export const createAsymSharedKey = (privateKey: string, peerPublicKey: string): string => {
	// see https://github.com/digitalbazaar/x25519-key-agreement-key-2019/blob/main/lib/crypto.js
	const publicKeyDerPrefix = new Uint8Array([48, 42, 48, 5, 6, 3, 43, 101, 110, 3, 33, 0]);
	const privateKeyDerPrefix = new Uint8Array([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 110, 4, 34, 4, 32]);

	const prvKeyBuf = bs58.decode(privateKey);
	const peerPubKeyBuf = bs58.decode(peerPublicKey);

	const privateKeyObject = crypto.createPrivateKey({
		key: Buffer.concat([privateKeyDerPrefix, prvKeyBuf]),
		format: 'der',
		type: 'pkcs8'
	});
	const publicKeyObject = crypto.createPublicKey({
		key: Buffer.concat([publicKeyDerPrefix, peerPubKeyBuf]),
		format: 'der',
		type: 'spki'
	});
	const sharedKey = crypto.diffieHellman({
		privateKey: privateKeyObject,
		publicKey: publicKeyObject
	});
	return bs58.encode(sharedKey);
};

export const asymEncrypt = (data: string, privateKey: string, publicKey: string): string => {
	const sharedKey = createAsymSharedKey(privateKey, publicKey);
	return encrypt(data, sharedKey.slice(0, secretLength));
};

export const asymDecrypt = (encrypted: string, privateKey: string, publicKey: string): string => {
	const sharedKey = createAsymSharedKey(privateKey, publicKey);
	return decrypt(encrypted, sharedKey.slice(0, secretLength));
};
