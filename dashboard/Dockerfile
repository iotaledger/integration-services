FROM node:16.14.2

# Needed otherwise docker-compose variables won't be applied during build time
ARG VITE_IOTA_IS_SDK_GATEWAY_URL
ENV VITE_IOTA_IS_SDK_GATEWAY_URL $VITE_IOTA_IS_SDK_GATEWAY_URL
ARG VITE_IOTA_IS_SDK_API_KEY
ENV VITE_IOTA_IS_SDK_API_KEY $VITE_IOTA_IS_SDK_API_KEY

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

CMD [ "npm", "run", "prod" ]
