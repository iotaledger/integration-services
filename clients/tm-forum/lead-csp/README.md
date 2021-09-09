# Lead CSP
This client will create a channel, authorize CSP1 and send a product order to CSP1

## Usage
1. Run the Lead CSP by executing: ```npm run serve``` in the root directory, it will automatically create an identity and a channel
2. Run CSP1 and copy the identity id to the .env file of the Lead CSP.
3. Rerun the Lead CSP by executing: ```npm run serve``` in the root directory, it will authorize CSP1 and will send an product order to CSP1