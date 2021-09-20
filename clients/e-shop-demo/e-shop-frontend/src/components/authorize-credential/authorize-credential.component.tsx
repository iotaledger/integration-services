import { useContext, useState } from "react";
import { UserContext } from "../../contexts/user.provider";
import { SmallButton } from "../../global.styles";
import { authenticate } from "../../services/authentication.service";

const AuthorizeCredential = () => {
  const [signedNonce, setSignedNonce] = useState<string>("");
  const { userIdentityId, setAuthenticated } = useContext(UserContext);

  const login = async () => {
      console.log(userIdentityId)
    const authenticated = await authenticate(signedNonce, userIdentityId);
    setAuthenticated(authenticated);
  };

  return (
    <>
    <label>
      <div>Signed nonce:</div>
      <input
        type="text"
        name="signed-nonce"
        onChange={(event: any) => setSignedNonce(event.target.value)}
      ></input>
      </label>
      <SmallButton onClick={() => login()}>Authorize</SmallButton>
    </>
  );
};

export default AuthorizeCredential;
