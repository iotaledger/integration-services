import fs from 'fs';
import swaggerJSDoc from 'swagger-jsdoc';
import * as dotenv from 'dotenv';
dotenv.config();
import { openApiDefinition } from '../../routers/swagger';

//
const converter = () => {
	const openapiSpecification = swaggerJSDoc(openApiDefinition);
	fs.writeFileSync('./src/tools/markdown-creator/openApiSpecification.json', JSON.stringify(openapiSpecification));
};

converter();
