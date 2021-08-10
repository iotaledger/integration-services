# CSP1 TMForum Proxy
This server proxies the TMForum API and writes intercepted payload to the tangle.

## Ussage
1. Create a channel and copy the channel address in the csp1-bbs and csp2-bss .env files
2. Run each Csp by executing: ```npm run serve``` or ```npm run start``` in their root directory, they will automaticaly create an identity and request a subscription to the channel
3. Authorize both clients by the subscriptionLink from the console
4. Run both Csps again by executing: ```npm run serve``` or ```npm run start```
* Csp1 will create an api and poll the channel for new violations
* Csp2 will write an violation to the channel that Csp1 is going to fetch and write to the tangle