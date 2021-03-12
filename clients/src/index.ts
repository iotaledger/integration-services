import * as dotenv from 'dotenv';
dotenv.config();
import { fetchAuth } from './authenticate';

async function app() {
  await fetchAuth();
  console.log('IT RUNS!');
}

app();
