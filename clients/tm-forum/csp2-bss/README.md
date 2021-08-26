# CSP2 TMForum Violation Writer
This client will write violation to a channel for Csp1 to fetch.

## Usage
1. Run the Lead CSP and copy the channel address in the csp1-bbs and csp2-bss .env files
2. Run each CSP by executing: ```npm run serve``` or ```npm run start``` in their root directory, they will automatically create an identity and request a subscription to the channel
3. Authorize both clients with the Lead CSP by the subscriptionLink from the console
* CSP2 will write an violation to the channel that CSP1 is going to fetch and write to the tangle