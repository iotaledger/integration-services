import { useState } from "react";
import { Button } from "../../global.styles";
import { getCredentials } from "../../services/verify-credential.service";

const GenerateNonce = () => {
  const [identityId, setIdentityId] = useState<string>();
  let nonce;
  const getNonce = () => {
    nonce = getCredentials(identityId);
  };

  return (
    <>
      <input
        type="text"
        onChange={(event: any) => setIdentityId(event.target.value)}
      ></input>
      <Button onClick={() => getNonce()}>Generate Nonce</Button>
      <p>Generated nonce: {nonce}</p>
    </>
  );
};

export default GenerateNonce;
