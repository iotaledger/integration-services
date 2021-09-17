import { useState } from "react";
import { Button } from "../../global.styles";
import { getCredentials } from "../../services/verify-credential.service";

const GenerateNonce = () => {
  const [identityId, setIdentityId] = useState<string>();
  const [nonce, setNonce] = useState<string>();

  const getNonce = async () => {
    setNonce(await getCredentials(identityId));
  };

  return (
    <>
      Identity ID:
      <input
        type="text"
        name="identity-id"
        onChange={(event: any) => setIdentityId(event.target.value)}
      ></input>
      <Button onClick={() => getNonce()}>Generate Nonce</Button>
      {nonce && (
        <>
          <p>Generated nonce: {nonce}</p>
          <p>Sign this nonce with your secret key using the provided tool.</p>
        </>
      )}
    </>
  );
};

export default GenerateNonce;
