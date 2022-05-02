FROM node:15.14.0-alpine3.10
WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

CMD [ "node", "dist/index.js", "server" ]