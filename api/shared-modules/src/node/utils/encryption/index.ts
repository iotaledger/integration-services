import * as crypto from 'crypto';
import * as ed from '@noble/ed25519';
import * as bs58 from 'bs58';
import * as aesjs from 'aes-js'

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
	const algorithm = 'aes-256-ctr';
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(algorithm, secret, iv);
	const encryptedText = Buffer.concat([cipher.update(message), cipher.final()]);
	return `${iv.toString('hex')},${encryptedText.toString('hex')}`;
};

export const decrypt = (cipher: string, secret: string) => {
	const algorithm = 'aes-256-ctr';
	const splitted = cipher.split(',');
	const iv = splitted[0];
	const hash = splitted[1];
	const decipher = crypto.createDecipheriv(algorithm, secret, Buffer.from(iv, 'hex'));
	const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
	return decrpyted.toString();
};

export const asymEncrypt = (data: any, privateKey: string, channelPublicKey: string): string => {
	const diffie = crypto.createDiffieHellman(bs58.decode(privateKey));
	const sharedKey = diffie.computeSecret(bs58.decode(channelPublicKey))
	const dataBytes = aesjs.utils.utf8.toBytes(JSON.stringify(data));
	const aesCtr = new aesjs.ModeOfOperation.ctr(sharedKey);
	const encrypted = aesCtr.encrypt(dataBytes);
	return bs58.encode(encrypted)
}

export const asymDecrypt = (encrypted: string, privateKey: string, channelPublicKey: string): string => {
	const diffie = crypto.createDiffieHellman(bs58.decode(privateKey));
	const sharedKey = diffie.computeSecret(bs58.decode(channelPublicKey))
	const aesCtr = new aesjs.ModeOfOperation.ctr(sharedKey);
	const decoded = bs58.decode(encrypted);
	const decrypted = aesCtr.decrypt(decoded)
	return JSON.parse(aesjs.utils.utf8.fromBytes(decrypted))
}