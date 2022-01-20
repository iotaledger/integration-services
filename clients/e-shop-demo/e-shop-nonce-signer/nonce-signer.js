import * as crypto from "crypto";
import * as ed from "@noble/ed25519";
import bs58 from "bs58";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please enter your nonce: ", (nonce) => {
  rl.stdoutMuted = true;
  rl.query = "Please enter your secrect key: ";
  rl.question(rl.query, async (secretKey) => {
    const encodedKey = getHexEncodedKey(secretKey);
    const signedNonce = await signNonce(encodedKey, nonce);
    rl.stdoutMuted = false;
    console.log("---------------------------------------");
    console.log(`Your signed nonce is: ${signedNonce}`);
    console.log("Use your signed nonce to log in to the e-shop.");
    rl.close();
  });
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write(
      "\x1B[2K\x1B[200D" +
        rl.query +
        "[" +
        (rl.line.length % 2 == 1 ? "=-" : "-=") +
        "]"
    );
  else rl.output.write(stringToWrite);
};
const getHexEncodedKey = (base58Key) => {
  return bs58.decode(base58Key).toString("hex");
};

const signNonce = async (secretKey, nonce) => {
  if (nonce.length !== 40) {
    console.log("nonce does not match length of 40 characters!");
    process.exit();
  }
  const hash = crypto
    .createHash("sha256")
    .update(nonce)
    .digest()
    .toString("hex");
  const signedHash = await ed.sign(hash, secretKey);
  return ed.Signature.fromHex(signedHash).toHex();
};
