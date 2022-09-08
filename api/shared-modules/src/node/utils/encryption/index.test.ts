import bs58 from 'bs58';
import crypto from 'crypto';
import {
	asymDecrypt,
	asymEncrypt,
	createNonce,
	createSharedKey,
	decrypt,
	encrypt,
	getHexEncodedKey,
	randomSecretKey,
	signNonce,
	verifySignedNonce
} from '.';
import KeyEncoder from 'key-encoder';
import { X25519 } from '@iota/identity-wasm/node';

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

fdescribe('test asymmetric encryption', () => {
	it('should create expected shared key', async () => {
		const keys = {
			public: '2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn',
			private: '8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg'
		};
		const keys2 = {
			public: '2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD',
			private: '9dyFq2gy5vWJ7WHeErx4CFfgWZWebESxJbmyuwWk6ceC'
		};
		const expectedSharedKey = 'HbktPyEcvtU1jCR68JXt9uoUPh7zKwethWAbbT3zZuGY';
		const sharedKey = createSharedKey(keys.private, keys2.public);
		const sharedKey2 = createSharedKey(keys2.private, keys.public);
		expect(sharedKey2).toEqual(sharedKey);
		expect(sharedKey2).toEqual(expectedSharedKey);
	});

	it('expect decrypted text to be same', () => {
		const publicChannelKey = '7DuUEuGkHny4i8rMiL7VdwmaYKCazMQ3iNSD2A1VKCeX';
		const privateKey = 'AiXHW7xKrYVMGwpo7vRBZ8u9z9Ey59hFQ9FKnoaLpF6b';
		const data = 'mystring';
		const encryptedText = asymEncrypt(data, privateKey, publicChannelKey);
		const decryptedText = asymDecrypt(encryptedText, privateKey, publicChannelKey);
		expect(decryptedText).toEqual(data);
	});

	it('expect too long key not to work', () => {
		const publicChannelKey = '7DuUEuGkHny4i8rMiL7VdwmaYKCazMQ3iNSD2A1VKCeXAiXHW7xKrYVMGwpo7vRBZ8u9z9Ey59hFQ9FKnoaLpF6b';
		const privateKey = 'AiXHW7xKrYVMGwpo7vRBZ8u9z9Ey59hFQ9FKnoaLpF6b7DuUEuGkHny4i8rMiL7VdwmaYKCazMQ3iNSD2A1';
		const text = 'Hello World!';
		const encryptedText = () => {
			asymEncrypt(text, privateKey, publicChannelKey);
		};
		expect(encryptedText).toThrowError('Invalid key length');
	});

	it('expect too small key not to work', () => {
		const privateKey = bs58.encode(Buffer.from('notsecurekey'));
		const publicChannelKey = bs58.encode(Buffer.from('noValidKey'));
		const text = 'Hello World!';
		const encryptedText = () => {
			asymEncrypt(text, privateKey, publicChannelKey);
		};
		expect(encryptedText).toThrowError('Invalid key length');
	});

	xit('should create same shared key', () => {
		const sharedKey = createSharedKey('AiXHW7xKrYVMGwpo7vRBZ8u9z9Ey59hFQ9FKnoaLpF6b', '2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD');
		const sharedKey2 = createSharedKey('BDkbGbEVoFLS1v1YiJauADBMc7HKkEF2VaJd3pY79yaN', '7DuUEuGkHny4i8rMiL7VdwmaYKCazMQ3iNSD2A1VKCeX');
		console.log('sharedKey', sharedKey);
		console.log('sharedKey2', sharedKey2);
		expect(sharedKey).toEqual(sharedKey2);
	});
	xit('1should create same shared key', () => {
		const diffHell = crypto.createDiffieHellman(512);
		diffHell.generateKeys();
		const pub1 = bs58.encode(diffHell.getPrivateKey());
		const prv1 = bs58.encode(diffHell.getPublicKey());

		const diffHell2 = crypto.createDiffieHellman(512);
		diffHell2.generateKeys();
		const pub2 = bs58.encode(diffHell2.getPrivateKey());
		const prv2 = bs58.encode(diffHell2.getPublicKey());
		const s2 = diffHell2.computeSecret(bs58.decode(pub1));
		const s1 = diffHell.computeSecret(bs58.decode(pub2));

		const sharedKey = createSharedKey(prv1, pub1);

		const sharedKey2 = createSharedKey(prv2, pub2);
		console.log('sharedKey', sharedKey);
		console.log('sharedKey2', sharedKey2);
		expect(bs58.encode(s1)).toEqual(bs58.encode(s2));
	});
	xit('2should create same shared key', () => {
		const diffHell = crypto.createDiffieHellman(512);
		diffHell.generateKeys();
		const pub1 = bs58.encode(diffHell.getPrivateKey());
		const prv1 = bs58.encode(diffHell.getPublicKey());

		const diffHell2 = crypto.createDiffieHellman(512);
		diffHell2.generateKeys();
		const pub2 = bs58.encode(diffHell2.getPrivateKey());
		const prv2 = bs58.encode(diffHell2.getPublicKey());
		const s2 = diffHell2.computeSecret(diffHell.getPublicKey());
		const s1 = diffHell.computeSecret(diffHell2.getPublicKey());

		const sharedKey = createSharedKey(prv1, pub2);

		const sharedKey2 = createSharedKey(prv2, pub1);
		console.log('sharedKey', sharedKey);
		console.log('sharedKey2', sharedKey2);
		expect(bs58.encode(s1)).toEqual(bs58.encode(s2));
	});

	xit('2should create same shared key', () => {
		const diffHell = crypto.createDiffieHellman(512);
		diffHell.generateKeys();

		const diffHell2 = crypto.createDiffieHellman(512);
		diffHell2.generateKeys();
		const s2 = diffHell2.computeSecret(diffHell.getPublicKey());
		const s1 = diffHell.computeSecret(diffHell2.getPublicKey());

		expect(bs58.encode(s1)).toEqual(bs58.encode(s2));
	});

	xit('2should create same shared key', () => {
		const diffHell = crypto.createDiffieHellman(512);
		diffHell.generateKeys();

		const diffHell2 = crypto.createDiffieHellman(512);
		diffHell2.generateKeys();
		console.log('diffHell.getPublicKey()', bs58.encode(diffHell.getPublicKey()));

		const bobPublicKey = crypto.createPublicKey(bs58.encode(diffHell.getPublicKey()));
		const bobPrivateKey = crypto.createPrivateKey(bs58.encode(diffHell.getPrivateKey()));

		const alicePublicKey = crypto.createPublicKey(bs58.encode(diffHell2.getPublicKey()));
		const alicePrivateKey = crypto.createPrivateKey(bs58.encode(diffHell2.getPrivateKey()));

		const sharedKey = crypto.diffieHellman({
			privateKey: bobPrivateKey,
			publicKey: alicePublicKey
		});
		const sharedKey2 = crypto.diffieHellman({
			privateKey: alicePrivateKey,
			publicKey: bobPublicKey
		});

		console.log('sharedKey2', sharedKey2);
		console.log('sharedKey', sharedKey);
		expect(sharedKey).toEqual(sharedKey2);
	});

	xit('2should create same shared key', () => {
		const bobKeyPair = crypto.generateKeyPairSync('x25519', {});
		const aliceKeyPair = crypto.generateKeyPairSync('x25519', {});
		const sharedKey = crypto.diffieHellman({
			privateKey: bobKeyPair.privateKey,
			publicKey: aliceKeyPair.publicKey
		});
		const sharedKey2 = crypto.diffieHellman({
			privateKey: aliceKeyPair.privateKey,
			publicKey: bobKeyPair.publicKey
		});

		console.log('sharedKey2', bs58.encode(sharedKey2));
		console.log('sharedKey', bs58.encode(sharedKey));
		expect(sharedKey).toEqual(sharedKey2);
	});

	xit('weee create same shared key', async () => {
		const keys = {
			public: bs58.decode('2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn'),
			private: bs58.decode('8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg')
		};
		const hex = keys.public.toString('hex');
	});
	xit('test key encoder', async () => {
		const keys = {
			public: bs58.decode('2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn'),
			private: bs58.decode('8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg')
		};
		const keyEncoder = new KeyEncoder('secp256k1');
		console.log('HEXKEY', keys.public.toString('hex'));
		console.log('HEXKEY', keys.private.toString('hex'));
		const pemPrivateKey = keyEncoder.encodePrivate(keys.private.toString('hex'), 'raw', 'pem');
		const pemPublicKey = keyEncoder.encodePublic(keys.public.toString('hex'), 'raw', 'pem');
		console.log('pemPrivateKey', pemPrivateKey);
		console.log('pemPublicKey', pemPublicKey);
		const pk = crypto.createPrivateKey(pemPrivateKey);
		const pub = crypto.createPublicKey(pemPublicKey);
		crypto.diffieHellman({ privateKey: pk, publicKey: pub });

		// 	-----BEGIN EC PRIVATE KEY-----
		// MHQCAQEEIHAFNIr6f4vn5FofJyrZceWHWQMlfDeHyxjq2dnHObdNoAcGBSuBBAAK
		// oUQDQgAEKV8hqUh9sTcsXRDM29UdZVHOoB1RXbFc9mOO3U4ugSqFMAUfpIZWrK/G
		// 0hLtnEtG6/LW2eUn4kiTXABUTD8eEA==
		// -----END EC PRIVATE KEY-----
	});

	xit('test elliptic', async () => {
		var EC = require('elliptic').ec;
		var ec = new EC('curve25519');
		const keys = {
			public: bs58.decode('2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn'),
			private: bs58.decode('8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg')
		};
		const keys2 = {
			public: bs58.decode('2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD'),
			private: bs58.decode('9dyFq2gy5vWJ7WHeErx4CFfgWZWebESxJbmyuwWk6ceC')
		};
		const sharedKey = X25519.keyExchange(keys2.private, keys.public);
		const sharedKey2 = X25519.keyExchange(keys.private, keys2.public);
		console.log('Shared encryption key: ', Buffer.from(sharedKey).toString('hex'), 'hex');
		console.log('Shared encryption key2: ', Buffer.from(sharedKey2).toString('hex'), 'hex');
		console.log('pub key before: ', keys2.public.toString('hex'));

		// Generate keys
		/* */
		var key1 = ec.keyPair({ priv: keys.private.toString('hex'), privEnc: 'hex', pub: keys.public.toString('hex'), pubEnc: 'hex' });
		var key2 = ec.keyPair({ priv: keys2.private.toString('hex'), privEnc: 'hex', pub: keys2.public.toString('hex'), pubEnc: 'hex' });
		console.log('__priv key', bs58.encode(Buffer.from(key1.getPrivate('hex'), 'hex')));
		console.log('__priv key', bs58.encode(Buffer.from(key2.getPrivate('hex'), 'hex')));
		console.log('__pub key', bs58.encode(Buffer.from(key1.getPublic('hex'), 'hex')));
		console.log('__pub key', bs58.encode(Buffer.from(key2.getPublic('hex'), 'hex')));

		const keypair = ec.genKeyPair();
		const keypair2 = ec.genKeyPair();
		var key1 = ec.keyFromPrivate(keys.private.toString('hex'), 'hex');
		var key2 = ec.keyFromPrivate(keys2.private.toString('hex'), 'hex');
		var key1pub = ec.keyFromPublic(keys.public.toString('hex'), 'hex');
		var key2pub = ec.keyFromPublic(keys2.public.toString('hex'), 'hex');

		var shared1 = key1.derive(keypair.getPublic());
		var shared2 = key2.derive(key1pub.getPublic());
		//console.log('prv key hexx', keypair.getPrivate('hex'));
		//	prv key hexx 0619c663b21b1e484825b7d7b4b25ab5026c8003c1d32775d3fb2db7a7207628

		//	  prv key QpF23mFonEuUj265FFwBh6XEQ7yvLutsrE3BpsmiJab
		const kex = ec.keyFromPrivate('98a8abaac53bd9019e7ef2d19894c3884a01360ad5bb104c4455d0f39e6aa65d', 'hex');
		console.log('prv key111', bs58.encode(Buffer.from(kex.getPrivate('hex'), 'hex')));
		console.log('prv key', bs58.encode(Buffer.from(key1.getPrivate('hex'), 'hex')));
		console.log('prv key', bs58.encode(Buffer.from(key2.getPrivate('hex'), 'hex')));

		console.log('Both shared secrets are BN instances');
		console.log(shared1.toString(16));
		console.log(shared2.toString(16));
	});

	// latest
	xit('1should create same shared key', () => {
		const diffHell = crypto.createDiffieHellman(512);
		diffHell.generateKeys();
		const pub1 = bs58.encode(diffHell.getPrivateKey());
		const prv1 = bs58.encode(diffHell.getPublicKey());
		const keys = {
			public: bs58.decode('2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn'),
			private: bs58.decode('8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg')
		};
		//const x = await crypto.webcrypto.subtle.importKey('raw', keys.public, 'EcKeyImportParams', true, ['encrypt', 'decrypt'])
		//const d = crypto.diffieHellman({ p}) secp256k1
		diffHell.setPrivateKey(keys.private);
		diffHell.setPublicKey(keys.public);
		console.log('pub1', bs58.encode(diffHell.getPrivateKey()));
		console.log('prv1', bs58.encode(diffHell.getPublicKey()));
		const s1 = diffHell.computeSecret(bs58.decode('2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD'));
		console.log(bs58.encode(s1));

		//const sharedKey2 = createSharedKey(prv2, pub2, pub1);
		//console.log('sharedKey', sharedKey);
		//console.log('sharedKey2', sharedKey2);
	});

	xit('2should create same shared key', () => {
		const keys = {
			public: bs58.decode('2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn'),
			private: bs58.decode('8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg')
		};
		const keys2 = {
			public: bs58.decode('2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD'),
			private: bs58.decode('9dyFq2gy5vWJ7WHeErx4CFfgWZWebESxJbmyuwWk6ceC')
		};
		const bobPublicKey = crypto.createPublicKey(bs58.encode(keys.public));
		const bobPrivateKey = crypto.createPrivateKey(bs58.encode(keys.private));

		const alicePublicKey = crypto.createPublicKey(bs58.encode(keys2.public));
		const alicePrivateKey = crypto.createPrivateKey(bs58.encode(keys2.private));

		const sharedKey = crypto.diffieHellman({
			privateKey: bobPrivateKey,
			publicKey: alicePublicKey
		});
		const sharedKey2 = crypto.diffieHellman({
			privateKey: alicePrivateKey,
			publicKey: bobPublicKey
		});

		console.log('sharedKey2', sharedKey2);
		console.log('sharedKey', sharedKey);
		expect(sharedKey).toEqual(sharedKey2);
	});

	xit('should create same shared key with keys from identity', () => {
		const keys = {
			public: bs58.decode('2QUVnUPWAkNF7s4udjHs9pU6m55BzpxoFHnNuWJDSALn'),
			private: bs58.decode('8YHGQoGDEGP9Fx85aTkVsBbEUhVQUjwDMJwYR2mcxQeg')
		};
		const keys2 = {
			public: bs58.decode('2oRg26QL64jmy5MkCLLzYbC6W5WiAjw1qMLtCbbDc9WD'),
			private: bs58.decode('9dyFq2gy5vWJ7WHeErx4CFfgWZWebESxJbmyuwWk6ceC')
		};
		const bobKeyPair = crypto.generateKeyPairSync('x25519', { privateKey: keys.private, publicKey: keys.public });
		const aliceKeyPair = crypto.generateKeyPairSync('x25519', {
			privateKey: keys2.private,
			publicKey: keys2.public
		});

		const sharedKey = crypto.diffieHellman({
			privateKey: bobKeyPair.privateKey,
			publicKey: aliceKeyPair.publicKey
		});
		const sharedKey2 = crypto.diffieHellman({
			privateKey: aliceKeyPair.privateKey,
			publicKey: bobKeyPair.publicKey
		});

		console.log('sharedKey22', sharedKey2.toString('base64'));
		console.log('sharedKey', sharedKey.toString('base64'));
		expect(sharedKey).toEqual(sharedKey2);
	});
});
