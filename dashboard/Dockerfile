FROM node:16.14.2

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

CMD [ "npm", "run", "prod" ]
