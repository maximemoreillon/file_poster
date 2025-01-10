# Using Nove v16 for ERR_OSSL_EVP_UNSUPPORTED
FROM node:16 as build-stage
WORKDIR /app
COPY package*.json ./

RUN npm install
COPY ./.env.docker ./.env.production
COPY ./ .
RUN npm run build

# Put the built app in an NGINX contaier
FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/docs /app
COPY nginx.conf /etc/nginx/nginx.conf

# Loading environment variables atg runtime
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
