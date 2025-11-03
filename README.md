# AI-Travel-Planner

简要说明：本项目包含一个 FastAPI 后端（`backend/`）和一个 React 前端（`frontend/`）。本 README 仅包含运行项目所需的最小说明：本地开发、Docker 运行与必要的环境变量。

## 前提

- Python 3.11+（用于后端）
- Node.js（用于前端）
- Docker 与 Docker Compose（可选，用于容器化运行）

## 本地开发（后端）

1. 进入后端目录并创建虚拟环境

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. 设置必需的环境变量（示例，按 `backend/core/config.py` 中实际字段设置）

```powershell
$env:SUPABASE_URL = "https://..."
$env:SUPABASE_KEY = "your_supabase_key"
$env:OPENAI_API_KEY = "your_openai_key"
$env:SECRET_KEY = "a_secret_for_jwt"
```

3. 启动后端服务

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端默认运行在 `http://localhost:8000`。

## 本地开发（前端）

1. 安装依赖并启动

```powershell
cd frontend
npm install
npm start
```

2. 配置环境变量（在 `frontend/.env` 或系统环境中）

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AMAP_KEY=your_amap_key
```

前端默认运行在 `http://localhost:3000`。

## 使用 Docker / Docker Compose（推荐用于快速运行）

1. 使用 docker-compose 启动（在仓库根目录）：

```powershell
docker-compose up --build
```

2. 通过镜像运行（如果你已有镜像 tar 或远程镜像）

```powershell
docker load -i ai-travel-backend.tar
docker load -i ai-travel-frontend.tar
docker run -d --name ai-travel-backend -p 8000:8000 yourrepo/ai-travel-backend:latest
docker run -d --name ai-travel-frontend -p 3000:80 yourrepo/ai-travel-frontend:latest
```

## 必要环境变量（最小集合）

- 后端：SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY, SECRET_KEY
- 前端（构建/运行）：REACT_APP_API_URL, REACT_APP_AMAP_KEY

将具体字段名与说明视 `backend/core/config.py` 和 `frontend/src` 中的引用为准。

## 测试

后端测试位于 `backend/tests/`，运行：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest -q
```

## 联系与贡献

如需改进部署、CI 或镜像发布策略，请在 issue 中说明你的需求并提交 PR。


