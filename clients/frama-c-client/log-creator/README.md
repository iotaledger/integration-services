# Log Creator Client
The Log Creator Client creates a channel and writes hashed logs to it.

## Prerequisite
Node.js 8, or Node.js 10 or higher. We recommend the latest [LTS](https://nodejs.org/en/download/).
## Installation
1. Navigate to: `frama-c-client\log-creator` 
2. Install dependencies: `npm install`  
3. Copy `.env-example` and rename to `.env` \
Adjust the BASE_URL to the url the client shall connect to and adjust the API_KEY. If no api key is needed completely remove this variable from the .env file.
4. If you choose to run the API locally, do not forget to start it!

## Usage
1. Create an identity for the Log Creator: `npm run create-identity`
2. Create a channel for the logs to be written on: `npm run create-stream-channel`
3. Copy the channel address from console and continue with step 2 at the Log Auditor
4. Insert the copied subscription link in the subscriptionLink variable at `src/config/index.ts`.
5. Authorize requested subscription by the Log Auditor: `npm run authorize-subscription`
6. Write logs to the created channe: `npm run write-stream-channel`
7. Continue with step 6 at the Log Auditor