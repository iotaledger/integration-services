# Log Creator / Auditor Client Example
This scripts creates logs with the log-creator and audits them afterwards with the log-auditor. Place files to be audited in the log-files folder. Each of the clients is in a sub folder of the frama-c-client.

**1. Client: Log Creator**

The log creator, creates a channel and stroes the hashed file in the channel which then can be audited by the log-auditor.

Subfolder:
**log-creator**

1. Client adds the attached file as local file into log-creator folder. File has some unique name as identifier.

2. The client creates an identity for himself with a claim representing information about him
```
{
  "username": "frama-c-log-creator",
  "claim": {
        "type":"Service",
        "name":"Frama C Log Creator",
        "category": "embedded-tool",
        "description":"Creates embedded logs"
   }
}
```
3. The client creates a stream channel with the body:
```
{
    "topics": [{"type":"hashed-audit-log-file","source":"frama-c-client"}]
}
```

> Then the second client needs to subscribe to this channel. After the client has subscribed, the log-creator can do the following:

4. Authorize client using its identity or subscriber link

5. Hash file and write the hash with a unique id of the file into the channel.

**2. Client: Log Auditor**

The log auditor subscribes to the channel and reads the hashed file from it. Then it compares the log with its file.

Subfolder:
**log-auditor**

1. Client adds the attached file as local file into log-creator folder. Give the file some unique identitifier. (Same as defined above)

2. The log-auditor also creates an identity with a claim representing information about him:
```
{
  "username": "frama-c-log-auditor",
  "claim": {
        "type":"Service",
        "name":"Frama C Log Auditor",
        "category": "embedded-tool",
        "description":"Audits embedded logs"
   }
}
```

3. Subscribe to channel of the log-creator by using the channel address.

> Now the first client needs to authorize the 2nd client and write data to the log afterwards. After this is done the audit client can fetch the data from the channel.

4. Fetch data from channel.

5. Locally hash the file and compare the fetched hash from the channel with the local file hash.

6. If they are the same, the auditor logs:
```
~~~~~~~Log log.json is valid!~~~~~~~
```


## Prerequisite
Node.js v16.17.0 or higher. We recommend the latest [LTS](https://nodejs.org/en/download/).

## Installation
1. Navigate to: `frama-c-client\run-example` 
2. Install dependencies: `npm install`  
3. Copy `.env-example` and rename to `.env` \
Adjust the BASE_URL to the url the client shall connect to and adjust the API_KEY. If no api key is needed completely remove this variable from the .env file.
4. If you choose to run the API locally, do not forget to start it!

## Usage
1. Run the script: `npm run start`
