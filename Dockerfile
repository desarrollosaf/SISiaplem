FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BASE_HREF=/

RUN npx ng build \
    --configuration production \
    --base-href ${BASE_HREF} \
    --deploy-url ${BASE_HREF}

FROM nginx:alpine

COPY --from=build /app/dist/SISiaplem/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]