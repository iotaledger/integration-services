import { useContext, useRef, useState } from "react";
import {
  CheckoutStepHeading,
  CheckoutWithIotaContainer,
  CheckoutWithIotaContainerHeading,
} from "./checkout-iota.styles";
import {
  verifyCredential,
  readJSON,
  checkAge,
} from "../../services/verify-credential.service";
import { UserContext } from "../../contexts/user.provider";
import GenerateNonce from "../generate-nonce/generate-nonce.component";
import AuthorizeCredential from "../authorize-credential/authorize-credential.component";
import { SmallButton } from "../../global.styles";
import MessageBox from "../message-box/message-box.component";

const CheckoutWithIota = () => {
  const inputRef = useRef<any>();
  const [aboveAgeRestriction, setAboveAgeRestriction] = useState<boolean>();
  const [file, setFile] = useState<File>();
  const {
    credential,
    setCredential,
    authenticated,
    isVerified,
    setIsVerified,
  } = useContext(UserContext);

  const onVerify = async () => {
    const credential = await readJSON(file as File);
    const verified = await verifyCredential(credential);
    setAboveAgeRestriction(checkAge(credential));
    if (verified && aboveAgeRestriction) {
      setCredential(credential);
      setIsVerified(verified);
    }
  };

  return (
    <CheckoutWithIotaContainer>
      <CheckoutWithIotaContainerHeading>
        Checkout with IOTA
      </CheckoutWithIotaContainerHeading>
      <label>
        <CheckoutStepHeading>Verify credential</CheckoutStepHeading>
        <input
          type="file"
          name="credentialFile"
          ref={inputRef}
          onChange={(event: any) => setFile(event.target.files[0] as File)}
        ></input>
      </label>
      {file && <SmallButton onClick={() => onVerify()}>Verify</SmallButton>}
      <MessageBox show={aboveAgeRestriction === false}>Credential is under age restriction!</MessageBox>
      {isVerified && (
        <>
          <MessageBox show={true}>Credential successful verified</MessageBox>
          <CheckoutStepHeading>Authorize credential</CheckoutStepHeading>
          {authenticated ? (
            <MessageBox show={authenticated}>
              Credential successful authorized
            </MessageBox>
          ) : (
            <>
              <GenerateNonce></GenerateNonce>
              <AuthorizeCredential></AuthorizeCredential>
            </>
          )}
        </>
      )}
    </CheckoutWithIotaContainer>
  );
};

export default CheckoutWithIota;
