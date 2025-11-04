# 构建阶段
FROM node:18-alpine AS build
WORKDIR /app

# 接受构建参数
ARG REACT_APP_API_URL=__RUNTIME_REACT_APP_API_URL__
ARG REACT_APP_AMAP_API_KEY=__RUNTIME_REACT_APP_AMAP_API_KEY__
ARG REACT_APP_AMAP_KEY=__RUNTIME_REACT_APP_AMAP_KEY__
ARG REACT_APP_AMAP_SECURITY_CODE=__RUNTIME_REACT_APP_AMAP_SECURITY_CODE__

# 将构建参数转换为环境变量
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_AMAP_API_KEY=$REACT_APP_AMAP_API_KEY
ENV REACT_APP_AMAP_KEY=$REACT_APP_AMAP_KEY
ENV REACT_APP_AMAP_SECURITY_CODE=$REACT_APP_AMAP_SECURITY_CODE

# 安装依赖
COPY package*.json ./
RUN npm ci --silent

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine

# 安装 envsubst 工具
RUN apk add --no-cache gettext

# 复制构建结果
COPY --from=build /app/build /usr/share/nginx/html

# 创建环境变量配置脚本
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "配置前端环境变量..."' >> /docker-entrypoint.sh && \
    echo 'cat > /usr/share/nginx/html/env-config.js << EOF' >> /docker-entrypoint.sh && \
    echo 'window._env_ = {' >> /docker-entrypoint.sh && \
    echo '  REACT_APP_API_URL: \"${REACT_APP_API_URL}\",' >> /docker-entrypoint.sh && \
    echo '  REACT_APP_AMAP_API_KEY: \"${REACT_APP_AMAP_API_KEY}\",' >> /docker-entrypoint.sh && \
    echo '  REACT_APP_AMAP_KEY: \"${REACT_APP_AMAP_KEY}\",' >> /docker-entrypoint.sh && \
    echo '  REACT_APP_AMAP_SECURITY_CODE: \"${REACT_APP_AMAP_SECURITY_CODE}\"' >> /docker-entrypoint.sh && \
    echo '};' >> /docker-entrypoint.sh && \
    echo 'EOF' >> /docker-entrypoint.sh && \
    echo 'exec "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]