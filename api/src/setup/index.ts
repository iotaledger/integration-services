import { existsSync, readFileSync, writeFileSync } from "fs";
import { addTrustedRootId } from "../database/trusted-roots";
import { IdentityJsonUpdate, CreateIdentityBody } from "../models/types/identity";
import { Subject, CredentialTypes } from "../models/types/verification";
import { UserService } from "../services/user-service";
import { VerificationService } from "../services/verification-service";
import { createNonce, signNonce, getHexEncodedKey, verifySignedNonce } from "../utils/encryption";
import { Logger } from "../utils/logger";

import * as serverIdentityJson from '../config/server-identity.json';
import * as VerifiableCredentialsDb from '../database/verifiable-credentials';
import { SsiService } from "../services/ssi-service";
import { KEY_COLLECTION_SIZE } from "../config/identity";
import { IdentityConfig } from "../models/config";

const logger = Logger.getInstance();

export class KeyGenerator {

    private identityConfig: IdentityConfig;
    private serverSecret: string;
    private serverIdentityFile: string;

    constructor(serverSecret: string, serverIdentityFile: string, identityConfig: IdentityConfig) {
        this.serverSecret = serverSecret;
        this.serverIdentityFile = serverIdentityFile;
        this.identityConfig = identityConfig;

        if (!this.serverSecret) {
            throw Error('A server secret must be defined to work with the API!');
        }

        if (!this.serverIdentityFile) {
            throw Error('You need to specify a server identity file');
        }
    }
        
    // Ensure that on the db there is the declared root identity
    async checkRootIdentity() : Promise<IdentityJsonUpdate> {
    
        logger.log(`Checking root identity...`);
    
        const serverIdentityId = this.getRootIdentity();
        if (!serverIdentityId) {
            logger.error("Root identity is missing")
            return null;
        }
    
        const ssiService = SsiService.getInstance(this.identityConfig, logger);
        const userService = new UserService(ssiService, this.serverSecret, logger);

        const tmpVerificationService = new VerificationService(
            ssiService,
            userService,
            {
                serverSecret: this.serverSecret,
                serverIdentityId,
                keyCollectionSize: KEY_COLLECTION_SIZE
            },
            logger
        );
    
        const serverIdentity = await tmpVerificationService.getIdentityFromDb(serverIdentityId);
    
        if (!serverIdentity) {
            throw Error('Root identity not found in database: ' + serverIdentityId);
        }
        
        return serverIdentity;
    
    }
    
    // Check if identity is a valid one
    private async verifyIdentity(serverIdentity: IdentityJsonUpdate) {
    
        // verify if secret key of the server can be used to sign and verify a challenge
        // if the secret key was changed the server won't be able to decrypt the secret key of the server
        // and thus is not able to verify the challenge
        logger.log('Check if server has valid keypair...');
        const nonce = createNonce();
        let verified = false;
        try {
            const signedNonce = await signNonce(getHexEncodedKey(serverIdentity.key.secret), nonce);
            verified = await verifySignedNonce(getHexEncodedKey(serverIdentity.key.public), nonce, signedNonce);
        } catch (e) {
            logger.error('error when signing or verifying the nonce, the secret key might have changed...');
        }
        if (!verified) {
            throw Error('server keys cannot be verified!');
        }
    
        logger.log('Api is ready to use!');
    
    }
    
    private async getRootIdentityFromId(serverIdentityId: string) : Promise<IdentityJsonUpdate> {
    
        // TODO #254 create initial documents and indexes in mongodb if they are missing on first initialization.
        // key-collection-links->linkedIdentity (unique + partial {"linkedIdentity":{"$exists":true}})
    
        const ssiService = SsiService.getInstance(this.identityConfig, logger);
        const userService = new UserService(ssiService, this.serverSecret, logger);
        const tmpVerificationService = new VerificationService(
            ssiService,
            userService,
            {
                serverSecret: this.serverSecret,
                serverIdentityId,
                keyCollectionSize: KEY_COLLECTION_SIZE
            },
            logger
        );
    
        return await tmpVerificationService.getIdentityFromDb(serverIdentityId);

    }

    public getRootIdentity() : string {

        if (!existsSync(this.serverIdentityFile)) {
            throw new Error("Server identity file is missing");
        }

        const rootIdentity = JSON.parse(readFileSync(this.serverIdentityFile).toString());
        if (!rootIdentity.root) {
            throw new Error("root field missing in the server identity file");
        }

        return rootIdentity.root

    }
    
    // Setup root identity
    async keyGeneration() {
    
        logger.log(`Setting root identity please wait...`);
        
        // Check if root identity exists and if it is valid
        try {
            const rootIdentity = this.getRootIdentity();
            if (rootIdentity) {
                logger.error("Root identity already exists: verify it, " + rootIdentity);
                const serverIdentity = await this.getRootIdentityFromId(rootIdentity)
                if (serverIdentity && this.verifyIdentity(serverIdentity)) {
                    logger.log('Root identity is already defined and valid: skip key generation')
                    return;
                }
                throw Error("Root identity malformed or not valid: " + rootIdentity);
            }
        }
        catch (e) {
            logger.error(e.message)
        }
            
        const serverData: CreateIdentityBody = serverIdentityJson;
        
        const ssiService = SsiService.getInstance(this.identityConfig, logger);
        const userService = new UserService(ssiService, this.serverSecret, logger);
        const identity = await userService.createIdentity(serverData);
    
        logger.log('==================================================================================================');
        logger.log(`== Store this identity in the as ENV var: ${identity.doc.id} ==`);
        logger.log('==================================================================================================');
    
        // re-create the verification service with a valid server identity id
        const verificationService = new VerificationService(
            ssiService,
            userService,
            {
                serverSecret: this.serverSecret,
                serverIdentityId: identity.doc.id,
                keyCollectionSize: KEY_COLLECTION_SIZE
            },
            logger
        );
    
        const serverUser = await userService.getUser(identity.doc.id);

        if (!serverUser) {
            throw new Error('server user not found!');
        }
        logger.log('Add server id as trusted root...');
        await addTrustedRootId(serverUser.identityId);
    
        logger.log('Generate key collection...');
        const index = await VerifiableCredentialsDb.getNextCredentialIndex(serverUser.identityId);
        const keyCollectionIndex = verificationService.getKeyCollectionIndex(index);
        const kc = await verificationService.getKeyCollection(keyCollectionIndex);
    
        if (!kc) {
            throw new Error('could not create the keycollection!');
        }
    
        logger.log('Set server identity as verified...');
        const subject: Subject = {
            claim: serverUser.claim,
            credentialType: CredentialTypes.VerifiedIdentityCredential,
            identityId: serverUser.identityId
        };

        await verificationService.verifyIdentity(subject, serverUser.identityId, serverUser.identityId);
        
        writeFileSync(this.serverIdentityFile, JSON.stringify({
            root: serverUser.identityId,
            doc: identity.doc
        }));
    
        logger.log(`Setup Done! Your root identity is: ${serverUser.identityId}`);
    
    }

}    