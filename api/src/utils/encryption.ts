import * as crypto from 'crypto';

export const createChallenge = (): string => {
  return crypto.randomBytes(30).toString('hex');
};

export function signChallenge(privateKeyStr: string, challenge: string) {
  const privateKey = crypto.createPrivateKey('DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499');
  return crypto.sign(null, Buffer.from(challenge), privateKey);
}

export function verifiyChallenge(publicKeyStr: string, challenge: string, signature: string) {
  const publicKey = crypto.createPublicKey({ key: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX' });
  return crypto.verify(null, Buffer.from(challenge), publicKey, Buffer.from(signature));
}

// "key": {
//     "type": "ed25519",
//     "public": "HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX",
//     "secret": "DizmPAxTct7rAxzDXEdSJB4Ni8HRwJ71vrRxLmy3H499"
// },
//const keypair = crypto.generateKeyPairSync('ed25519');
//const pub = keypair.publicKey;
//const prv = keypair.privateKey;

// const key = {
//   algorithm: 'ed25519',
//   name: 'ed25519',
//   passphrase: 'HmvXxyyzaA9B5CMp63xG9ptEkgwmHgaYVStdDsYxzDTX',
//   pem: false,
//   ppk: false,
//   pub: false,
//   public: false,
//   private: false
// };
// key.pem = (fs.existsSync("./" + key.name + ".pem")) ? fs.readFileSync("./" + key.name + ".pem") : false;

// const pub = crypto.createPublicKey(key);
// console.log('pub ', pub);

// var prime_length = 60;
// var diffHell = crypto.createDiffieHellman(prime_length);
// diffHell.generateKeys('base64');
// console.log('Public Key : ', diffHell.getPublicKey('base64'));
// console.log('Private Key : ', diffHell.getPrivateKey('base64').toString());
// signChallenge(diffHell.getPrivateKey().toString(), 'challenge');
