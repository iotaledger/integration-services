import { existsSync, readFileSync } from "fs";
import { Logger } from "../utils/logger";

const logger = Logger.getInstance();

export class KeyResolver {

    public resolve(serverEntity: string) : string {

        if (!existsSync(serverEntity)) {
            return null;
        }

        const rootIdentity = JSON.parse(readFileSync(serverEntity).toString());
        if (!rootIdentity.root) {
            logger.error('root field missing in the SERVER_IDENTITY file');
            return null;
        }

        return rootIdentity.root

    }

}