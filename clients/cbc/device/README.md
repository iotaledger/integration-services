# Device
Device which creates and identity, authenticates at the api and subscribes to a channel. After it is authorized by the author, it writes payloads to the channel.

## Usage
1. Copy the .env-example and rename it to .env
2. Set the following environment variables to the appropriate values:

```
BASE_URL=http://localhost:3000/api/v1
API_KEY=<INSERT_API_KEY>
CHANNEL_ADDRESS=<INSERT_CHANNEL_ADDRESS>
```

3. Run the device using `npm run serve`
