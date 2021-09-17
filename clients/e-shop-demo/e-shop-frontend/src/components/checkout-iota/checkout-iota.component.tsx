import { useState } from "react";
import { CheckoutWithIotaContainer } from "./checkout-iota.styles";
import { uploadCredential } from "../../services/verify-credential.service";

const CheckoutWithIota = () => {
  const [file, setFile] = useState<File>();

  return (
    <CheckoutWithIotaContainer>
      <h3>Checkout with IOTA</h3>
      <input
        type="file"
        name="credentialFile"
        onChange={(event: any) => setFile(event.target.files[0] as File)}
      ></input>
      <button onClick={() => uploadCredential(file as File)}>
        Upload Credentials
      </button>
    </CheckoutWithIotaContainer>
  );
};

export default CheckoutWithIota;
