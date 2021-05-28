import { createNonce, decrypt, encrypt, getHexEncodedKey, randomSecretKey, signNonce, verifySignedNonce } from '.';

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
		console.log('signed', signed.length);

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
			public: 'HmvXxyyzaA9B5CMp6', // wrong public key used!
			secret: 'DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499'
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('bd0e5f2291ba549f162b3b692738bf711d3d4fd582dcbba1473bab0df81cce64');
		expect(pubKey).toBe('0378e976dd46ae01ac7520c933');

		const challenge = createNonce();
		const signed = await signNonce(prvKey, challenge);
		const isVerified = await verifySignedNonce(pubKey, challenge, signed);
		expect(isVerified).toBe(false);
	});

	it('verify signed challenge using a wrong private key should return false', async () => {
		const keypair = {
			type: 'ed25519',
			public: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
			secret: 'DizmPAxTct7rAxzDXEd' // wrong private key used!
		};
		const prvKey = getHexEncodedKey(keypair.secret);
		const pubKey = getHexEncodedKey(keypair.public);

		expect(prvKey).toBe('229c56832429000cf9e8051b6fde');
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
		expect(encryptedText).toThrowError('Invalid key length');
	});

	it('expect too small key not to work', async () => {
		const secretKey = 'notsecurekey';
		const text = 'Hello World!';
		const encryptedText = () => {
			encrypt(text, secretKey);
		};
		expect(encryptedText).toThrowError('Invalid key length');
	});
});
