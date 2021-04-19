import * as crypto from 'crypto';
import * as ed from 'noble-ed25519';
import * as bs58 from 'bs58';

export const createChallenge = (): string => {
	const challenge = crypto.randomBytes(30).toString('hex');
	return crypto.createHash('sha256').update(challenge).digest().toString();
};

export const getHexEncodedKey = (base58Key: string): string => {
	return bs58.decode(base58Key).toString('hex');
};

export const signChallenge = async (privateKey: string, challenge: string): Promise<string> => {
	return await ed.sign(challenge, privateKey);
};

export const verifiyChallenge = async (publicKey: string, challenge: string, signature: string): Promise<boolean> => {
	return await ed.verify(signature, challenge, publicKey);
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
