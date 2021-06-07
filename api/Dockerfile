FROM node:15.14.0-alpine3.10
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .
COPY ./src/streams-lib/wasm-node/ ./dist/streams-lib/wasm-node/
RUN npm run build

EXPOSE 3000
CMD [ "node", "dist/index.js" ]