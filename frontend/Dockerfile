# 构建阶段
FROM node:18-alpine AS build
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --silent

# 复制源代码
COPY . .

# 使用统一的占位符构建（所有变量都等待运行时替换）
ENV REACT_APP_API_URL=__RUNTIME_API_URL__
ENV REACT_APP_AMAP_API_KEY=__RUNTIME_AMAP_API_KEY__
ENV REACT_APP_AMAP_KEY=__RUNTIME_AMAP_KEY__
ENV REACT_APP_AMAP_SECURITY_CODE=__RUNTIME_AMAP_SECURITY_CODE__

# 构建应用（此时所有变量都是占位符）
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine
RUN apk add --no-cache gettext

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建结果
COPY --from=build /app/build /usr/share/nginx/html


# 创建统一的运行时替换脚本
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "=== 开始替换环境变量占位符 ==="' >> /docker-entrypoint.sh && \
    echo 'echo "REACT_APP_API_URL: ${REACT_APP_API_URL}"' >> /docker-entrypoint.sh && \
    echo 'echo "REACT_APP_AMAP_API_KEY: ${REACT_APP_AMAP_API_KEY:0:10}..."' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# 替换所有静态文件中的占位符' >> /docker-entrypoint.sh && \
    echo 'for file in $(find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.json" \)); do' >> /docker-entrypoint.sh && \
    echo '  if grep -q "__RUNTIME_" "$file"; then' >> /docker-entrypoint.sh && \
    echo '    echo "处理文件: $file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|__RUNTIME_API_URL__|${REACT_APP_API_URL}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|__RUNTIME_AMAP_API_KEY__|${REACT_APP_AMAP_API_KEY}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|__RUNTIME_AMAP_KEY__|${REACT_APP_AMAP_KEY}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|__RUNTIME_AMAP_SECURITY_CODE__|${REACT_APP_AMAP_SECURITY_CODE}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '  fi' >> /docker-entrypoint.sh && \
    echo 'done' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'echo "=== 环境变量替换完成 ==="' >> /docker-entrypoint.sh && \
    echo 'exec "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]