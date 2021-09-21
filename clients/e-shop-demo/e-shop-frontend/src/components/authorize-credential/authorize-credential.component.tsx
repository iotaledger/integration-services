import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/user.provider";
import { Input, SmallButton } from "../../global.styles";
import { authenticate } from "../../services/authentication.service";
import MessageBox from "../message-box/message-box.component";

const AuthorizeCredential = () => {
  const [error, setError] = useState(false);
  const [signedNonce, setSignedNonce] = useState<string>("");
  const { userIdentityId, setAuthenticated } = useContext(UserContext);

  const login = async () => {
    setError(false);
    const auth = await authenticate(signedNonce, userIdentityId);
    setError(!auth);
    setAuthenticated(auth);
  };

  return (
    <>
    <label>
      <div>Signed nonce:</div>
      <Input
        type="text"
        name="signed-nonce"
        onChange={(event: any) => setSignedNonce(event.target.value)}
      ></Input>
      </label>
      <SmallButton style={{marginLeft: 0}} onClick={() => login()}>Authenticate</SmallButton>
      <MessageBox type="danger" show={error}>
              Could not authenticate credential
            </MessageBox>
    </>
  );
};

export default AuthorizeCredential;
