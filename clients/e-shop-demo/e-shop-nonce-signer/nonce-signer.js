import * as crypto from "crypto";
import * as ed from 'noble-ed25519';
import bs58 from "bs58";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please enter your nonce: ", (nonce) => {
  rl.question("Please enter your secrect key: ", async (secretKey) => {
    console.log(nonce, secretKey);
    const encodedKey = getHexEncodedKey(secretKey);
    const signedNonce = await signNonce(encodedKey, nonce);
    console.log('---------------------------------------')
    console.log(`Your signed nonce is: ${signedNonce}`);
    console.log("Use your signed nonce to log in to the e-shop.");
    rl.close();
  });
});

const getHexEncodedKey = (base58Key) => {
  return bs58.decode(base58Key).toString("hex");
};

const signNonce = async (secretKey, nonce) => {
  if (nonce.length !== 40) {
    print("nonce does not match length of 40 characters!");
    process.exit();
  }
  const hash = crypto
    .createHash("sha256")
    .update(nonce)
    .digest()
    .toString("hex");
  return await ed.sign(hash, secretKey);
};
