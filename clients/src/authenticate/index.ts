import fetch from 'node-fetch';
import { Config } from '../config';

export const fetchAuth = async () => {
  const response = await fetch(`${Config.baseUrl}/api/v1/users/search`);
  if (response.status === 200) {
    await response.json();
  } else {
    console.log('didnt receive status 200!');
  }
};
