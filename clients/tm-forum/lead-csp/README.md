# Lead CSP
This client will create a channel, authorize both CSPs and send a product order to CSP1-bbs

## Usage
1. Run the Lead CSP by executing: ```npm run serve``` or ```npm run start``` in the root directory, it will automatically create an identity and a channel
2. Run CSP1 and CSP2 and copy their subscription links to the .env file of the Lead CSP.
3. Rerun the Lead CSP by executing: ```npm run serve``` or ```npm run start``` in the root directory, it will authorize both CSPs and will send an product order to CSP1