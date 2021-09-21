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
  const { setCredential, authenticated, isVerified, setIsVerified } =
    useContext(UserContext);

  const onVerify = async () => {
    setIsVerified(false);
    const credential = await readJSON(file as File);
    const verified = await verifyCredential(credential);
    const ageCheck = checkAge(credential);
    setAboveAgeRestriction(ageCheck);
    if (verified && ageCheck) {
      setIsVerified(verified);
      setCredential(credential);
    }
  };

  const onFileChange = (file: File) => {
    setFile(file);
    setIsVerified(false);
    setCredential(undefined);
    setAboveAgeRestriction(undefined);
  }

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
          onChange={(event: any) => onFileChange(event.target.files[0] as File)}
        ></input>
      </label>
      {file && <SmallButton onClick={() => onVerify()}>Verify</SmallButton>}
      <MessageBox type="danger" show={aboveAgeRestriction === false}>
        Credential is under age restriction!
      </MessageBox>
      {isVerified && (
        <>
          <MessageBox type="success" show={true}>
            Credential successful verified
          </MessageBox>
          <CheckoutStepHeading>Authenticate credential</CheckoutStepHeading>
          {authenticated ? (
            <MessageBox type="success" show={authenticated}>
              Credential successful authenticated
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
