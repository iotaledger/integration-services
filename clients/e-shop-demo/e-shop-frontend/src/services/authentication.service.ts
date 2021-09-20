import { client, setAuthHeader } from "../utils/axios-client";

export const generateNonce = async (identityId: any): Promise<string> => {
  const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/nonce/${identityId}`;
  const response = await client.get(url);
  console.log(response.data);
  return response.data.nonce;
};

export const authenticate = async (
  signedNonce: string,
  identityId: string
): Promise<boolean> => {
  const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/authenticate/${identityId}`;
  const response = await client.post(url, JSON.stringify({ signedNonce }));
  console.log(response.data);
  if (response.status === 200) {
    const jwt = response.data.jwt;
    setAuthHeader(jwt)
    return true;
  }
  return false;
};
