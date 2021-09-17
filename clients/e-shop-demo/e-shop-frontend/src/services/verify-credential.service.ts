import axios from "axios";

export const uploadCredential = async (file: File) => {
  const identity = await readJSON(file);
  const credential = await getCredentials(identity);
};

const readJSON = (file: File): Promise<object> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(JSON.parse(fileReader.result as string));
    fileReader.onerror = () => reject;
    fileReader.readAsText(file);
  });
};

export const getCredentials = async (identityId: any): Promise<string> => {
  const url = `${process.env.REACT_APP_E_SHOP_BACKEND_URL}/authenticate/${identityId}`;
  const response = await axios.get(url);
  console.log(response.data);
  return response.data.nonce;
};
