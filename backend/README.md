# Backend

后端（FastAPI）说明

- 目录：`backend/`
- 主要职责：提供后端 REST API、与第三方 AI 服务（OpenAI/讯飞）和持久层（Supabase）交互，处理语音（STT）、行程与费用管理。

关键点（基于当前代码）

- FastAPI 应用入口：`backend/app/main.py`（注册了 `auth`、`trips`、`ai`、`expenses`、`preferences` 等路由）。
- CORS：允许来自 `http://localhost:3000` 的请求（前端开发时常用）。
- 常见 API 路径示例：`/`（根）、`/api/trips`、`/api/trips/{id}/expenses`、`/api/voice/stt`、`/api/nlu/parse`（以代码中的路由实现为准）。

依赖

依赖列在 `backend/requirements.txt` 中。主要包包括：

- fastapi
- uvicorn[standard]
- pydantic / pydantic-settings
- pymongo
- python-jose（用于 JWT）
- passlib[bcrypt]
- httpx
- websockets
- python-multipart

快速开始（开发）

下面命令以 Windows PowerShell 为例：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 启动开发服务器（热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

测试

项目包含后端测试（位于 `backend/tests/`）。运行示例：

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

环境变量与配置

配置项请参考 `backend/core/config.py`；项目可能需要以下环境变量（依据实际代码调整）：

- SUPABASE_URL / SUPABASE_KEY 或数据库连接字符串
- OPENAI_API_KEY
- IFLYTEK_*（讯飞相关的 appid/key）
- SECRET_KEY / JWT 设置（auth 相关）

注意：不要将密钥提交到仓库。推荐使用本地 `.env`（并在 `.gitignore` 中忽略）或通过 CI/托管平台的 secrets 注入。

部署与 Docker

仓库中可能包含 `backend/app/Dockerfile`（或可以自行添加）。对于生产部署，建议使用适当的进程管理和反向代理（例如 Gunicorn/Uvicorn + nginx 或容器化部署）。

进一步阅读

查看以下文件以获取更多上下文：

- `backend/app/main.py`（路由与 CORS 设置）
- `backend/services/`（第三方服务集成，如 `openai_service.py`、`iflytek_service.py`）
- `backend/db/`（Supabase/Mongo 封装）

运行镜像 / Docker

1) 使用仓库提供的 Dockerfile 构建镜像（位于 `backend/app/Dockerfile`）：

```powershell
cd <repo-root>
docker build -t yourdockeruser/ai-travel-backend:latest -f backend/app/Dockerfile backend/app
```

2) 直接运行构建好的镜像：

```powershell
docker run -d --name ai-travel-backend -p 8000:8000 yourdockeruser/ai-travel-backend:latest
```

3) 如果你从仓库下载到了镜像 tar 包（例如 `ai-travel-backend.tar`），先加载镜像再运行：

```powershell
docker load -i ai-travel-backend.tar
docker run -d --name ai-travel-backend -p 8000:8000 yourdockeruser/ai-travel-backend:latest
```

注意：确保在运行容器前正确配置环境变量（SUPABASE、OPENAI 等），可以在 `docker run` 时通过 `-e VAR=value` 注入，或使用 `docker-compose` 管理。

