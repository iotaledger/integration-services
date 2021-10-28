import { existsSync, readFileSync } from "fs";
import { Logger } from "../utils/logger";

const logger = Logger.getInstance();

// Read root identity (if exists) from SERVER_IDENTITY path otherwise it raises an exception
export function readRootIdentity(serverIdentityFile: string) {
    
    if (!existsSync(serverIdentityFile)) {
        return null;
    }

    const rootIdentity = JSON.parse(readFileSync(serverIdentityFile).toString());
    if (!rootIdentity.root) {
        logger.error('root field missing in the SERVER_IDENTITY file');
        return null;
    }

    return rootIdentity.root

}
