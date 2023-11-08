FROM node:20-alpine3.17 as build

ARG SV_MODE

WORKDIR /app

COPY . .

RUN npm i

RUN npm run build

FROM nginx:alpine

WORKDIR /

COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
