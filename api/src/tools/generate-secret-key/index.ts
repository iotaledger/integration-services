import { randomSecretKey } from '../../../../clients/summer-school-client/src/utils/encryption/index';

const scrt = randomSecretKey();

console.log('Please store the server secret in the .env file as following:');

console.log(`SERVER_SECRET=${scrt}`);
