import { RequestInit } from 'node-fetch';
import fetch from 'node-fetch';
import { Config } from '../config';
import { fetchAuth } from '../authenticate';

// counter is just to avoid loops!
let counter = 0;

const body: any = {
  userId: 'did:iota:Ced3EL4XN7mLy5ACPdrNsR8HZib2MXKUQuAMQYEMbcb4',
  publicKey: '8WaGsr277JQaqV9fxHmFNGC9haApFbBfdnytmq5gq4vm',
  username: 'first-user',
  firstName: 'Tom',
  lastName: 'Sonson',
  organization: 'IOTA',
  classification: 'human',
  subscribedChannelIds: [],
  description: 'Just a user'
};

let fetchOptions: RequestInit = {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json'
  }
};

export const updateUser = async () => {
  console.log('requesting update user endpoint...');
  const res = await fetch(`${Config.baseUrl}/api/v1/users/user`, fetchOptions);
  console.log(`received status from update user endpoint: ${res.status}`);
  if (res.status !== 200) {
    if (res.status === 401 && counter < 1) {
      counter++;
      const authRes = await fetchAuth();

      if (authRes.status === 200) {
        const responseBody = await authRes.json();
        if (!responseBody.jwt) {
          console.error('no jwt received!');
          return;
        }

        fetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            Authorization: 'Bearer ' + responseBody.jwt
          }
        };
        await updateUser();
      } else {
        console.error('could not fetch auth endpoint successfully.');
      }
    } else {
      console.error('Could not update the user!');
    }
    return;
  } else {
    console.log('successfully updated user!');
  }
};
