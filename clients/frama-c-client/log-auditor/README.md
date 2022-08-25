# Log Auditor Client
The Log Auditor Client reads logs from a channel and validates them.

## Prerequisite
Node.js v16.17.0 or higher. We recommend the latest [LTS](https://nodejs.org/en/download/).
## Installation
1. Navigate to: `frama-c-client\log-auditor` 
2. Install dependencies: `npm install`  
3. Copy `.env-example` and rename to `.env` \
Adjust the BASE_URL to the url the client shall connect to and adjust the API_KEY. If no api key is needed completely remove this variable from the .env file.
4. If you choose to run the API locally, do not forget to start it!

## Usage
1. Start with step 1 at the Log Creator.
2. Insert the copied channel address in the channelAddress variable at `src/config/index.ts`.
3. Create an identity for the Log Auditor: `npm run create-identity`
4. Request a subscription to the channel created by the Log Creator: `npm run request-subscription`
5. Copy the subscriber link from console and continue with step 4 at the Log Creator
6. Read the logs from the channel: `npm run get-channel-data`
7. Audit the logs: `npm run audit-channel-data`
8. The document should be valid.
9. (Optional) Edit one of the documents and run `npm run audit-channel-data` again. Now you should receive an **Log is invalid!** in the console.