# CSP1 TMForum Proxy
This server proxies the TMForum API and writes intercepted payloads to the tangle.

## Usage
1. Run the Lead CSP and copy the channel address in the csp1-bbs and csp2-bss .env files
2. Run each CSP by executing: ```npm run serve``` or ```npm run start``` in their root directory, they will automatically create an identity and request a subscription to the channel
3. Authorize both clients with the Lead CSP by the subscriptionLink from the console
* CSP1 will create an api and poll the channel for new violations