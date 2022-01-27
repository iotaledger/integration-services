import { randomSecretKey } from '../../utils/encryption';

const scrt = randomSecretKey();

console.log('Please store the server secret in the .env file as following:');

console.log(`SERVER_SECRET=${scrt}`);
