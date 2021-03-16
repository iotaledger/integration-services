import * as dotenv from 'dotenv';
dotenv.config();
import { fetchAuth } from './authenticate';

async function app() {
  console.log('Fetching authentication...');
  await fetchAuth();
  console.log('---- done ----');
}

app();
