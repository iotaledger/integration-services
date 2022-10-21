import bs58 from 'bs58';
import {
	asymDecrypt,
	asymEncrypt,
	createNonce,
	createAsymSharedKey,
	decrypt,
	encrypt,
	getHexEncodedKey,
	randomSecretKey,
	signNonce,
	verifySignedNonce
} from '.';

describe('test encryption', () => {
	it('too short nonce so it should throw an error', async () => {
		const keypair = {
			type: 'ed25519',
			public: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
			secret: 'DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499'
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('bd0e5f2291ba549f162b3b692738bf711d3d4fd582dcbba1473bab0df81cce64');
		expect(pubKey).toBe('f93d13cee076a3660d5bd212719654a3c50c9575ae8f19de2c9a0155f3891fea');

		const nonce = 'shortnonce';
		await expect(signNonce(prvKey, nonce)).rejects.toThrow('nonce must have a length of 40 characters!');
	});
	it('too short signature so it should throw an error', async () => {
		const keypair = {
			type: 'ed25519',
			public: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
			secret: 'DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499'
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('bd0e5f2291ba549f162b3b692738bf711d3d4fd582dcbba1473bab0df81cce64');
		expect(pubKey).toBe('f93d13cee076a3660d5bd212719654a3c50c9575ae8f19de2c9a0155f3891fea');

		const nonce = createNonce();
		const signed = 'tooshortsignature';

		await expect(verifySignedNonce(pubKey, nonce, signed)).rejects.toThrow('wrong length of nonce or signature!');
	});

	it('verify signed challenge using valid keys should be true', async () => {
		const keypair = {
			type: 'ed25519',
			public: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
			secret: 'DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499'
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('bd0e5f2291ba549f162b3b692738bf711d3d4fd582dcbba1473bab0df81cce64');
		expect(pubKey).toBe('f93d13cee076a3660d5bd212719654a3c50c9575ae8f19de2c9a0155f3891fea');

		const nonce = createNonce();
		const signed = await signNonce(prvKey, nonce);
		const isVerified = await verifySignedNonce(pubKey, nonce, signed);
		expect(isVerified).toBe(true);
	});

	it('verify signed challenge using a wrong public key should return false', async () => {
		const keypair = {
			type: 'ed25519',
			public: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTT', // wrong public key used!
			secret: 'DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499'
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('bd0e5f2291ba549f162b3b692738bf711d3d4fd582dcbba1473bab0df81cce64');
		expect(pubKey).toBe('f93d13cee076a3660d5bd212719654a3c50c9575ae8f19de2c9a0155f3891fe6');

		const challenge = createNonce();
		const signed = await signNonce(prvKey, challenge);
		const isVerified = await verifySignedNonce(pubKey, challenge, signed);
		expect(isVerified).toBe(false);
	});

	it('verify signed challenge using a wrong private key should return false', async () => {
		const keypair = {
			type: 'ed25519',
			public: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
			secret: 'DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H492' // wrong private key used!
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('bd0e5f2291ba549f162b3b692738bf711d3d4fd582dcbba1473bab0df81cce5d');
		expect(pubKey).toBe('f93d13cee076a3660d5bd212719654a3c50c9575ae8f19de2c9a0155f3891fea');

		const challenge = createNonce();
		const signed = await signNonce(prvKey, challenge);
		const isVerified = await verifySignedNonce(pubKey, challenge, signed);
		expect(isVerified).toBe(false);
	});

	it('expect decrypted text to be same', async () => {
		const secretKey = randomSecretKey();
		const text = 'Hello World!';
		const encryptedText = encrypt(text, secretKey);
		const decryptedText = decrypt(encryptedText, secretKey);
		expect(decryptedText).toBe(text);
	});

	it('expect too long key not to work', async () => {
		const secretKey = randomSecretKey() + randomSecretKey(); // Too long key is used!
		const text = 'Hello World!';
		const encryptedText = () => {
			encrypt(text, secretKey);
		};
		expect(encryptedText).toThrowError('secret must have 32 characters!');
	});

	it('expect too small key not to work', async () => {
		const secretKey = 'notsecurekey';
		const text = 'Hello World!';
		const encryptedText = () => {
			encrypt(text, secretKey);
		};
		expect(encryptedText).toThrowError('secret must have 32 characters!');
	});
});

describe('test asymmetric encryption', () => {
	const keys = {
		public: '2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn',
		private: '8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg'
	};
	const keys2 = {
		public: '2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD',
		private: '9dyFq2gy5vWJ7WHeErx4CFfgWZWebESxJbmyuwWk6ceC'
	};
	it('should create expected shared key', async () => {
		const expectedSharedKey = 'HbktPyEcvtU1jCR68JXt9uoUPh7zKwethWAbbT3zZuGY';
		const sharedKey = createAsymSharedKey(keys.private, keys2.public);
		const sharedKey2 = createAsymSharedKey(keys2.private, keys.public);
		expect(sharedKey2).toEqual(sharedKey);
		expect(sharedKey2).toEqual(expectedSharedKey);
	});

	it('expect decrypted text to be same', () => {
		const publicChannelKey = keys2.public;
		const privateKey = keys.private;
		const data = 'mystring';
		const encryptedText = asymEncrypt(data, privateKey, publicChannelKey);
		const decryptedText = asymDecrypt(encryptedText, privateKey, publicChannelKey);
		expect(decryptedText).toEqual(data);
	});

	it('expect too small key not to work', () => {
		const privateKey = bs58.encode(Buffer.from('7DuUEuGkHny4i8'));
		const publicChannelKey = bs58.encode(Buffer.from('AiXHW7xKrYVMGwpo'));
		const text = 'Hello World!';
		const encryptedText = () => {
			asymEncrypt(text, privateKey, publicChannelKey);
		};
		expect(encryptedText).toThrowError();
	});
});
