This folder includes client prototypes which do basic requests to the api.

HowTo:

1. Copy .env file

Copy the `.env-example` and rename it to `.env`

2. Adjust values

Adjust the `BASE_URL` to the url the client shall connect to and adjust the `API_KEY`. If no api key is needed completely remove this variable from the `.env` file.

3. Run the client

Run the client using `npm install` & `npm run start` or use `ts-node src/index.ts` as an alternative.
