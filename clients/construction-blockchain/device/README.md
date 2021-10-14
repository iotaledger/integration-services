# CSP1 TMForum Proxy
This server proxies the TMForum API and writes intercepted payloads to the tangle.

## Usage
1. Run the Lead CSP and copy the channel address in the csp1-bbs .env file
2. Run CSP1 by executing: ```npm run serve``` in the root directory, it will automatically create an identity and request a subscription to the channel
3. Authorize CSP1 with the Lead CSP by the identity id from the console
* CSP1 will create an api