import { MongoClient } from "mongodb";
const crypto = require("crypto");
// const { MongoClient } = require("mongodb");

export class Manager {

    private client: MongoClient;

    constructor(private mongoURL: string, private secretKey: string) {
        this.client = new MongoClient(mongoURL);
    }

    async getRootIdentity() {
        await this.client.connect();
        const database = this.client.db('integration-service-db');
        const identities = database.collection('identity-docs');
        let identity = await identities.findOne({});
        await this.decrypt(identity, this.secretKey);
        return identity;
    }

    private decrypt(identity: any, secret: string) {
        let cipher = identity?.key?.secret;
        const algorithm = 'aes-256-ctr';
        const splitted = cipher.split(',');
        const iv = splitted[0];
        const hash = splitted[1];
        const decipher = crypto.createDecipheriv(algorithm, secret, Buffer.from(iv, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
        identity.key.secret = decrpyted.toString();
    }

}
