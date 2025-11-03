FROM node:18-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --silent

# copy sources and build (accept build ARGs for env vars used by CRA)
COPY . .
ARG REACT_APP_API_URL
ARG REACT_APP_AMAP_API_KEY
ARG REACT_APP_AMAP_KEY
ARG REACT_APP_AMAP_SECURITY_CODE

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_AMAP_API_KEY=${REACT_APP_AMAP_API_KEY}
ENV REACT_APP_AMAP_KEY=${REACT_APP_AMAP_KEY}
ENV REACT_APP_AMAP_SECURITY_CODE=${REACT_APP_AMAP_SECURITY_CODE}

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
