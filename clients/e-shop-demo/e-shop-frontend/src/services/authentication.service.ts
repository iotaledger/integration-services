import { client, setAuthHeader } from "../utils/axios-client";

export const generateNonce = async (identityId: any): Promise<string> => {
  const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/nonce/${identityId}`;
  const response = await client.get(url);
  return response.data.nonce;
};

export const authenticate = async (
  signedNonce: string,
  identityId: string
): Promise<boolean> => {
  try {
    const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/authenticate/${identityId}`;
    const response = await client.post(url, JSON.stringify({ signedNonce }));
    const jwt = response.data.jwt;
    setAuthHeader(jwt);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
